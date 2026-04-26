"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Phone, Mail, Calendar, Briefcase, Sprout, Star, IndianRupee, Tag } from "lucide-react"

interface ProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: any // Can be Farmer or Dhalari object
    type: "farmer" | "dhalari"
}

export function ProfileDialog({ open, onOpenChange, user, type }: ProfileDialogProps) {
    if (!user) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-600" />
                        {user.name}
                    </DialogTitle>
                    <DialogDescription>
                        {type === "farmer" ? "Farmer Profile" : "Trader Profile"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${type === 'farmer' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                            <User className={`w-10 h-10 ${type === 'farmer' ? 'text-emerald-600' : 'text-blue-600'}`} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className={`font-medium ${!user.phone || user.phone.includes('*') ? 'text-gray-500 italic' : ''}`}>
                                {user.phone && !user.phone.includes('*') ? user.phone : "Hidden (Connect to view)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className={`font-medium ${!user.email ? 'text-gray-500 italic' : ''}`}>
                                {user.email || "Hidden (Connect to view)"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{user.location || "Location not set"}</span>
                        </div>

                        {/* Common Fields */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Experience: {user.experience || 0} years</span>
                        </div>

                        {type === "farmer" && user.land_size !== undefined && (
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                <Sprout className="w-4 h-4 text-emerald-600" />
                                <span>Land Size: {user.land_size} acres</span>
                            </div>
                        )}

                        {type === "farmer" && user.success_rate !== undefined && (
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span>Success Rate: {user.success_rate}% ({user.total_deals} deals)</span>
                            </div>
                        )}

                        {type === "dhalari" && (
                            <>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                    {/* Handle both snake_case (backend) and camelCase (frontend mock) */}
                                    <span>Business: {user.business_name || user.businessName || "Not listed"}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span>Rating: {user.rating || "New"}</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                    <IndianRupee className="w-4 h-4 text-green-600" />
                                    <span>Commission: {user.commission !== undefined ? user.commission : 5}%</span>
                                </div>
                                {user.specialization && user.specialization.length > 0 && (
                                    <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <Tag className="w-4 h-4 text-purple-500" />
                                            <span className="font-medium">Specialization:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 ml-7">
                                            {user.specialization.map((spec: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className="text-xs bg-white">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
