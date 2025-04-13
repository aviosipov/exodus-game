import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container"; // Assuming you might want to use Container for layout

// TODO: Fetch this list dynamically from the filesystem or an API route
const adventures = [
    { id: "days_of_honor", title: "ימי הכבוד" },
    // Add more adventures here as they are created
];

export default function AdventureListPage() {
    return (
        <div dir="rtl" className="p-8">
            <Container> {/* Optional: Wrap content in a container */}
                <h1 className="text-3xl font-bold mb-6">בחר הרפתקה</h1>
                <ul className="space-y-4">
                    {adventures.map((adventure) => (
                        <li key={adventure.id}>
                            <Link href={`/adventure/${adventure.id}`}>
                                <span className="block p-4 bg-blue-100 hover:bg-blue-200 rounded-lg cursor-pointer transition duration-300">
                                    {adventure.title}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
                {adventures.length === 0 && (
                    <p>לא נמצאו הרפתקאות.</p>
                )}
            </Container>
        </div>
    );
}
