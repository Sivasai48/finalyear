from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MarketPrice
from ..schemas import MarketPriceCreate, MarketPriceResponse
from ..schemas.market_price import CropMarketData, MonthlyPriceData

router = APIRouter(prefix="/api/market-prices", tags=["Market Prices"])


@router.get("", response_model=List[MarketPriceResponse])
async def get_all_market_prices(
    skip: int = 0,
    limit: int = 100,
    crop_name: str = None,
    location: str = None,
    db: Session = Depends(get_db)
):
    """Get all market prices with optional filtering."""
    query = db.query(MarketPrice)
    
    if crop_name:
        query = query.filter(MarketPrice.crop_name.ilike(f"%{crop_name}%"))
    
    if location:
        query = query.filter(MarketPrice.location.ilike(f"%{location}%"))
    
    prices = query.order_by(MarketPrice.recorded_at.desc()).offset(skip).limit(limit).all()
    return prices


@router.get("/{crop_name}", response_model=CropMarketData)
async def get_crop_market_data(crop_name: str, db: Session = Depends(get_db)):
    """Get market data for a specific crop including APMC prices."""
    prices = db.query(MarketPrice).filter(
        MarketPrice.crop_name.ilike(f"%{crop_name}%")
    ).order_by(MarketPrice.recorded_at.desc()).all()
    
    if not prices:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No market data found for {crop_name}"
        )
    
    # Get latest price as current
    current_price = prices[0].current_price if prices else 0
    
    # Generate sample monthly data (in production, this would come from historical data)
    monthly_data = [
        MonthlyPriceData(month="Jan", price=current_price * 0.96, predicted=current_price * 0.98),
        MonthlyPriceData(month="Feb", price=current_price * 1.0, predicted=current_price * 1.01),
        MonthlyPriceData(month="Mar", price=current_price * 1.04, predicted=current_price * 1.03),
        MonthlyPriceData(month="Apr", price=current_price * 0.98, predicted=current_price * 1.0),
        MonthlyPriceData(month="May", price=current_price * 0.94, predicted=current_price * 0.96),
        MonthlyPriceData(month="Jun", price=current_price * 0.92, predicted=current_price * 0.94),
    ]
    
    return CropMarketData(
        crop_name=crop_name.capitalize(),
        current_price=current_price,
        unit="per quintal",
        monthly_data=monthly_data,
        apmc_prices=[MarketPriceResponse.model_validate(p) for p in prices[:5]]
    )


@router.post("", response_model=MarketPriceResponse, status_code=status.HTTP_201_CREATED)
async def create_market_price(
    price_data: MarketPriceCreate,
    db: Session = Depends(get_db)
):
    """Create a new market price entry (admin only in production)."""
    price = MarketPrice(
        crop_name=price_data.crop_name,
        current_price=price_data.current_price,
        location=price_data.location,
        unit=price_data.unit
    )
    db.add(price)
    db.commit()
    db.refresh(price)
    return price
