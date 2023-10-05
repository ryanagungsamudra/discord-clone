import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

// export const currentProfile = async () => {
//     const { userId } = auth()

//     if (!userId) {
//         return null
//     }

//     const profile = await db.profile.findUnique({
//         where: {
//             userId
//         }
//     })

//     return profile
// }

export const currentProfile = async () => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  try {
    const profile = await db.profile.findUnique({
      where: {
        userId,
      },
    });

    return profile;
  } catch (error: any) {
    if (
      error.message.includes(
        "Can't reach database server at aws.connect.psdb.cloud:3306"
      )
    ) {
      // Handle the specific database connection error here
      // For example, you can return a custom error message or log the error
      console.error("Database connection error:", error);
      throw new Error("Database connection error. Please try again later.");
    } else {
      // Handle other types of errors or rethrow them if needed
      throw error;
    }
  }
};