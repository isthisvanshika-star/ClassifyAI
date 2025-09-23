import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("studentId");
  const campusId = req.nextUrl.searchParams.get("campusId");

  if (!userId || !campusId) {
    return NextResponse.json({ error: "Student ID and Campus ID are required" }, { status: 400 });
  }
  
  try {
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        campusId: campusId,
      },
      select: {
        premiumExpiresAt: true,
        premiumFeatures: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found on this campus" }, { status: 404 });
    }

    const isPremium = user.premiumExpiresAt && user.premiumExpiresAt > new Date();
    const featureSet = new Set(user.premiumFeatures.map((f) => f.name));
    
    // --- CORRECTED PLAN CALCULATION LOGIC ---
    let planName = "Free"; // Start with the default plan

    if (isPremium) {
        // Check for the highest tier feature first
        if (featureSet.has("CALENDAR_SYNC")) {
            planName = "Ultimate";
        } 
        // If not Ultimate, check for a Pro feature
        else if (featureSet.has("STUDY_PLAN") || featureSet.has("BUNK_MANAGER")) {
            planName = "Pro";
        }
        // If they are premium but have no specific Pro/Ultimate features, they are on a basic Premium plan
        else if (featureSet.size > 0) {
            planName = "Premium"
        }
    }
    // --- END OF CORRECTED LOGIC ---

    return NextResponse.json({
      isPremium: !!isPremium,
      plan: planName,
      features: Array.from(featureSet),
      premiumExpiresAt: user.premiumExpiresAt,
    });
  } catch (err) {
    console.error("Failed to fetch premium status: ", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}