import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import QuickChatForm from "../components/forms/QuickChatForm";

export default function Home() {
    return (
        <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-orange-950 text-white">
            <Navbar />

            <main className="flex flex-col items-center justify-center py-20">
                <h1 className="text-6xl font-bold text-orange-500">
                    ScoreMark QuickChat
                </h1>

                <p className="mt-5 text-gray-400 text-xl">
                    Create WhatsApp Links & QR Codes Instantly
                </p>

                <div className="mt-12">
                    <QuickChatForm />
                </div>
            </main>

            <Footer />
        </div>
    );
}