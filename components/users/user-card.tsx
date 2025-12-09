"use client";

import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Briefcase, Mail} from "lucide-react";
import clsx from "clsx";
import {Applicant} from "@/types/dashboard";

export type UserCardVariant = "compact" | "full" | "withAvatar";

function UserCard({
                      user, variant = "full", onViewProfile, onContact,
                  }: {
    user: Applicant;
    variant?: UserCardVariant;
    onViewProfile?: (id: number) => void;
    onContact?: (u: Applicant) => void;
}) {
    const showAvatar = variant === "withAvatar" || variant === "full";

    return (<Card className="border-border/50 bg-card p-5 shadow-sm hover:shadow-md transition">
            <CardContent className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-4 flex-1">

                    {/* ⭐ Avatar */}
                    {showAvatar && (<Avatar className="h-12 w-12 border shadow-sm">
                            <AvatarImage src={user.avatarUrl ?? ""} alt={user.name}/>
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {user.name?.charAt(0).toUpperCase() ?? "?"}
                            </AvatarFallback>
                        </Avatar>)}

                    {/* TEXT INFO */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{user.name}</h3>

                            {user.status && variant !== "compact" && (<Badge
                                    className={clsx("text-[11px]", user.status === "new" ? "bg-blue-500/10 text-blue-700" : "bg-gray-300 text-gray-700")}
                                >
                                    {user.status === "new" ? "Nouveau" : "Consulté"}
                                </Badge>)}
                        </div>

                        {variant !== "compact" && (<div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                {user.position && (<p className="flex items-center gap-1">
                                        <Briefcase className="h-3 w-3"/>
                                        Poste : {user.position}
                                    </p>)}

                                {user.email && (<p className="flex items-center gap-1">
                                        <Mail className="h-3 w-3"/>
                                        {user.email}
                                    </p>)}

                                {user.appliedAt && (<p>Candidature envoyée {user.appliedAt}</p>)}
                            </div>)}
                    </div>
                </div>

                {/* RIGHT SIDE BUTTONS */}
                <div className="flex gap-2">

                    {onViewProfile && (<Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewProfile(user.id)}
                        >
                            Voir profil
                        </Button>)}

                    {onContact && variant !== "compact" && (<Button
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => onContact(user)}
                        >
                            Contacter
                        </Button>)}

                </div>
            </CardContent>
        </Card>);
}

export default UserCard
