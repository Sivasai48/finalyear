
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, Calendar, Shield, ShieldCheck, Star, TrendingUp, Handshake } from "lucide-react";

interface ProfileHeaderProps {
    name: string;
    type: "Farmer" | "Dhalari";
    location: string;
    joinDate: string;
    image?: string;
    isVerified?: boolean;
}

export const ProfileHeader = ({ name, type, location, joinDate, image, isVerified }: ProfileHeaderProps) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="relative mb-20">
            {/* Cover Banner */}
            <div className={`h-48 w-full rounded-xl bg-gradient-to-r ${type === 'Farmer' ? 'from-emerald-400 to-green-600' : 'from-blue-400 to-indigo-600'}`}>
                <div className="absolute inset-0 bg-black/10 rounded-xl" />
            </div>

            {/* Profile Info */}
            <div className="absolute -bottom-12 left-6 right-6 flex items-end gap-6">
                <div className="relative shrink-0">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
                        <AvatarImage src={image} alt={name} />
                        <AvatarFallback className={`text-xl md:text-3xl font-bold ${type === 'Farmer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {isVerified && (
                        <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified">
                            <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                        </div>
                    )}
                </div>

                <div className="mb-2 min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                        <span className="truncate max-w-full block">{name}</span>
                        <Badge variant="secondary" className={`shrink-0 ${type === 'Farmer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {type}
                        </Badge>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 mt-1">
                        <span className="flex items-center gap-1 text-sm md:text-base"><MapPin className="w-4 h-4 shrink-0" /> <span className="truncate">{location}</span></span>
                        <span className="flex items-center gap-1 text-sm md:text-base"><Calendar className="w-4 h-4 shrink-0" /> Joined {joinDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProfileStatsProps {
    successRate: number;
    totalDeals: number;
    rating?: number;
    activeListings?: number;
}

export const ProfileStats = ({ successRate, totalDeals, rating, activeListings }: ProfileStatsProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 mb-8">
            <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
                    <div className="text-2xl font-bold">{successRate}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <Handshake className="w-8 h-8 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">{totalDeals}</div>
                    <div className="text-xs text-gray-500">Deals Completed</div>
                </CardContent>
            </Card>

            {rating !== undefined && (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Star className="w-8 h-8 text-amber-500 mb-2" />
                        <div className="text-2xl font-bold">{rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                    </CardContent>
                </Card>
            )}

            {activeListings !== undefined && (
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-8 h-8 text-purple-500 mb-2 font-bold text-xl border-2 border-purple-500 rounded-full flex items-center justify-center">
                            {activeListings}
                        </div>
                        <div className="text-2xl font-bold">{activeListings}</div>
                        <div className="text-xs text-gray-500">Active Listings</div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

interface ContactInfoProps {
    phone: string | null;
    email: string | null;
    isConnected: boolean;
}

export const ContactInfo = ({ phone, email, isConnected }: ContactInfoProps) => {
    return (
        <Card className="mb-6">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium flex items-center gap-2">
                                {phone || "Hidden"}
                                {!isConnected && <Shield className="w-4 h-4 text-gray-400" />}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium flex items-center gap-2 break-all">
                                {email || "Hidden"}
                                {!isConnected && <Shield className="w-4 h-4 text-gray-400 shrink-0" />}
                            </p>
                        </div>
                    </div>

                    {!isConnected && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2 mt-2">
                            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>Contact details are hidden to protect privacy. Connect with this user by sending a request to view full details.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
