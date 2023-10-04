import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowBigLeftDash } from "lucide-react";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }
    if (!params.inviteCode) {
        return redirect("/");
    }

    // Handle if the user is already in the server
    const existingServer = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
    });
    if (existingServer) {
        return redirect(`/servers/${existingServer.id}`);
    }

    // Handle if the invite code is invalid
    const invalidInviteCode = await db.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
        },
    })
    if (!invalidInviteCode) {
        return (
            <div className="flex w-full h-[100vh] justify-center items-center">
                <div className="flex flex-wrap text-2xl font-semibold">
                    <div className="w-full text-center">Sorry the invitation link is invalid :(</div>
                    <div className="w-full text-center mt-6">
                        <Link href="/">
                            <Button variant={"primary"} className="= text-white gap-2">
                                <ArrowBigLeftDash />
                                Back to home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Handle if the invite code is valid 
    const server = await db.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: [{ profileId: profile.id }],
            },
        },
    });
    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    return null
};

export default InviteCodePage;
