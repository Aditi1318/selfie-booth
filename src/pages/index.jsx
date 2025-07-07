import {useState, useRef, useCallback, useEffect} from "react";
import {Camera, Download, Share2, RotateCcw, Sun, Moon, Sparkles, Heart, Star} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {Card} from "@/components/ui/Card";
import {toast} from "sonner";
import html2canvas from "html2canvas";

const Index = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeFilter, setActiveFilter] = useState("none");
    const [isFlashing, setIsFlashing] = useState(false);
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [isCollageMode, setIsCollageMode] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const collageRef = useRef(null);

    const filters = [
        {name: "none", label: "Original", class: "", emoji: "📷"},
        {name: "sepia", label: "Sepia", class: "sepia(100%)", emoji: "🏜️"},
        {name: "grayscale", label: "B&W", class: "grayscale(100%)", emoji: "⚫"},
        {name: "vintage", label: "Vintage", class: "sepia(50%) contrast(120%) brightness(110%)", emoji: "📻"},
        {name: "cartoon", label: "Cartoon", class: "contrast(150%) saturate(200%) brightness(110%)", emoji: "🎨"},
        {name: "sparkle", label: "Sparkle", class: "saturate(150%) brightness(120%) hue-rotate(15deg)", emoji: "✨"},
        {
            name: "neon",
            label: "Neon",
            class: "saturate(200%) contrast(150%) brightness(130%) hue-rotate(90deg)",
            emoji: "🌈",
        },
        {name: "alien", label: "Alien", class: "hue-rotate(180deg) saturate(200%) contrast(120%)", emoji: "👽"},
        {
            name: "zombie",
            label: "Zombie",
            class: "sepia(80%) hue-rotate(60deg) saturate(150%) contrast(130%)",
            emoji: "🧟",
        },
        {name: "royal", label: "Royal", class: "hue-rotate(270deg) saturate(150%) brightness(110%)", emoji: "👑"},
        {
            name: "fire",
            label: "Fire",
            class: "hue-rotate(20deg) saturate(200%) contrast(140%) brightness(120%)",
            emoji: "🔥",
        },
        {
            name: "ice",
            label: "Ice",
            class: "hue-rotate(180deg) saturate(120%) brightness(130%) contrast(110%)",
            emoji: "❄️",
        },
    ];

    const collageStyles = [
        {
            name: "polaroid",
            bg: "bg-gradient-to-br from-yellow-50 to-orange-100",
            border: "border-4 border-none shadow-lg rotate-1",
            emoji: "📸",
            symbols: ["⭐", "💫", "✨"],
        },
        {
            name: "scrapbook",
            bg: "bg-gradient-to-br from-pink-100 to-purple-100",
            border: "border-2 border-dashed border-pink-300 shadow-md -rotate-1",
            emoji: "💕",
            symbols: ["🌸", "💖", "🦄"],
        },
        {
            name: "retro",
            bg: "bg-gradient-to-br from-orange-100 to-red-100",
            border: "border-4 border-orange-300 shadow-xl rotate-2",
            emoji: "🕺",
            symbols: ["🌟", "⚡", "🎵"],
        },
        {
            name: "neon",
            bg: "bg-gradient-to-br from-cyan-100 to-purple-100",
            border: "border-2 border-cyan-400 shadow-lg shadow-cyan-200/50",
            emoji: "🌈",
            symbols: ["💎", "🔮", "⚡"],
        },
    ];

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({video: {facingMode: "user"}});
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast.error("Unable to access camera. Please check your permissions.");
        }
    };

    const takeSelfie = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = filters.find((f) => f.name === activeFilter)?.class || "none";
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setCapturedPhotos((prev) => [...prev, imageData]);
        const currentFilter = filters.find((f) => f.name === activeFilter);
        toast.success(`${currentFilter?.emoji} Perfect ${currentFilter?.label} shot! Photo captured!`);
    }, [activeFilter]);

    const downloadPhoto = (photo, index) => {
        const link = document.createElement("a");
        link.download = `selfie-${index + 1}.png`;
        link.href = photo;
        link.click();
        toast.success("Photo downloaded! 📱");
    };

    const sharePhoto = async (photo) => {
        try {
            const blob = await (await fetch(photo)).blob();
            const file = new File([blob], "selfie.png", {type: "image/png"});
            if (navigator.share) {
                await navigator.share({files: [file], title: "Check out my selfie!"});
            } else {
                await navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
                toast.success("Photo copied to clipboard! 📋");
            }
        } catch (error) {
            console.error("Error sharing:", error);
            toast.error("Unable to share photo");
        }
    };

    const resetPhotos = () => {
        setCapturedPhotos([]);
        setIsCollageMode(false);
        toast.success("Photos cleared! 🗑️");
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        toast.success(`Switched to ${!isDarkMode ? "dark" : "light"} mode! ✨`);
    };

    const getRandomCollageStyle = () => {
        return collageStyles[Math.floor(Math.random() * collageStyles.length)];
    };

    const handleDownloadCollage = async () => {
        if (!collageRef.current) return;

        const canvas = await html2canvas(collageRef.current, {
            useCORS: true,
            scale: 2,
        });

        const link = document.createElement("a");
        link.download = "film-reel-collage.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        toast.success("Film reel collage downloaded! 🎞️✨");
    };

    return (
        <div
            className={`min-h-screen transition-all duration-500 ${
                isDarkMode
                    ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
                    : "bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100"
            }`}
        >
            {/* Flash overlay */}
            {isFlashing && <div className="fixed inset-0 bg-white z-50 animate-pulse opacity-80" />}

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* Header */}
                {/* ... Full JSX code from the user ... */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-3 rounded-full ${
                                isDarkMode ? "bg-purple-600" : "bg-gradient-to-r from-pink-500 to-purple-600"
                            }`}
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                Selfie Studio ✨
                            </h1>
                            <p className={`text-sm ${isDarkMode ? "text-purple-200" : "text-purple-600"}`}>
                                Create amazing selfies & collages 📸
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={toggleTheme}
                            variant="outline"
                            size="sm"
                            className={`${
                                isDarkMode
                                    ? "border-purple-400 text-purple-200 hover:bg-purple-800"
                                    : "border-purple-300 text-purple-600 hover:bg-purple-50"
                            }`}
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>

                        {capturedPhotos.length > 0 && (
                            <Button
                                onClick={resetPhotos}
                                variant="outline"
                                size="sm"
                                className={`${
                                    isDarkMode
                                        ? "border-red-400 text-red-200 hover:bg-red-900"
                                        : "border-red-300 text-red-600 hover:bg-red-50"
                                }`}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Camera Section */}
                    <div className="lg:col-span-2">
                        <Card
                            className={`p-6 ${
                                isDarkMode ? "bg-gray-800/50 border-purple-500/30" : "bg-white/70 border-purple-200"
                            } backdrop-blur-sm`}
                        >
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full aspect-video rounded-lg object-cover transition-all duration-300 ${
                                        activeFilter !== "none" ? `filter-${activeFilter}` : ""
                                    }`}
                                    style={{
                                        filter: filters.find((f) => f.name === activeFilter)?.class || "none",
                                        transform: "scaleX(-1)", // Mirror effect
                                    }}
                                />

                                {/* Filter overlay effects */}
                                {(activeFilter === "sparkle" || activeFilter === "neon" || activeFilter === "fire") && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-4 left-4 animate-pulse">
                                            <Sparkles className="w-6 h-6 text-yellow-300" />
                                        </div>
                                        <div className="absolute top-8 right-8 animate-pulse delay-500">
                                            <Star className="w-4 h-4 text-pink-300" />
                                        </div>
                                        <div className="absolute bottom-6 left-1/3 animate-pulse delay-1000">
                                            <Heart className="w-5 h-5 text-purple-300" />
                                        </div>
                                        {activeFilter === "fire" && (
                                            <>
                                                <div className="absolute top-1/2 right-4 animate-bounce delay-700">
                                                    <span className="text-2xl">🔥</span>
                                                </div>
                                                <div className="absolute bottom-1/3 left-8 animate-bounce delay-300">
                                                    <span className="text-xl">⚡</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Take Photo Button */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <Button
                                        onClick={takeSelfie}
                                        size="lg"
                                        className={`w-16 h-16 rounded-full text-white font-bold shadow-lg transition-all duration-200 hover:scale-110 ${
                                            isDarkMode
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                                : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500"
                                        }`}
                                    >
                                        📸
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Selection */}
                            <div className="mt-6">
                                <h3
                                    className={`text-lg font-semibold mb-3 ${
                                        isDarkMode ? "text-white" : "text-gray-800"
                                    }`}
                                >
                                    Choose Your Filter 🎭
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {filters.map((filter) => (
                                        <button
                                            key={filter.name}
                                            onClick={() => setActiveFilter(filter.name)}
                                            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex flex-col items-center gap-1 ${
                                                activeFilter === filter.name
                                                    ? isDarkMode
                                                        ? "bg-purple-600 text-white shadow-lg"
                                                        : "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                                                    : isDarkMode
                                                    ? "bg-gray-700 text-purple-200 hover:bg-gray-600"
                                                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                                            }`}
                                        >
                                            <span className="text-lg">{filter.emoji}</span>
                                            <span className="text-xs">{filter.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Photo Gallery */}
                    <div className="space-y-6">
                        <Card
                            className={`p-6 ${
                                isDarkMode ? "bg-gray-800/50 border-purple-500/30" : "bg-white/70 border-purple-200"
                            } backdrop-blur-sm`}
                        >
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                Your Photos ({capturedPhotos.length}) 📚
                            </h3>

                            {capturedPhotos.length === 0 ? (
                                <div
                                    className={`text-center py-8 ${isDarkMode ? "text-purple-200" : "text-purple-600"}`}
                                >
                                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Take your first selfie! 🤳</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {capturedPhotos.map((photo, index) => {
                                        const style = getRandomCollageStyle();
                                        return (
                                            <div
                                                key={index}
                                                className={`relative group p-3 rounded-xl ${style.bg} ${style.border} transition-all duration-300 hover:scale-105`}
                                            >
                                                {/* Decorative symbols */}
                                                <div className="absolute -top-1 -right-1 text-lg animate-pulse">
                                                    {style.emoji}
                                                </div>
                                                <div className="absolute -bottom-1 -left-1 text-sm animate-bounce delay-500">
                                                    {style.symbols[index % style.symbols.length]}
                                                </div>

                                                <img
                                                    src={photo}
                                                    alt={`Selfie ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg shadow-sm"
                                                    style={{transform: "scaleX(-1)"}}
                                                />

                                                {/* Overlay with action buttons */}
                                                <div className="absolute inset-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                                                    <Button
                                                        onClick={() => downloadPhoto(photo, index)}
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => sharePhoto(photo)}
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                                    >
                                                        <Share2 className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                {/* Photo number badge */}
                                                <div className="absolute top-1 left-1 bg-white/80 text-purple-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                    {index + 1}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {capturedPhotos.length > 1 && (
                                <Button
                                    onClick={() => setIsCollageMode(!isCollageMode)}
                                    className={`w-full mt-4 ${
                                        isDarkMode
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                            : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500"
                                    } text-white`}
                                >
                                    {isCollageMode ? "📸 Back to Camera" : "🎨 Create Collage"}
                                </Button>
                            )}
                        </Card>

                        {/* Enhanced Collage Preview */}
                        {isCollageMode && capturedPhotos.length > 1 && (
                            <Card
                                className={`p-6 ${
                                    isDarkMode ? "bg-gray-800/50 border-purple-500/30" : "bg-white/70 border-purple-200"
                                } backdrop-blur-sm`}
                            >
                                <h3
                                    className={`text-lg font-semibold mb-4 ${
                                        isDarkMode ? "text-white" : "text-gray-800"
                                    }`}
                                >
                                    Film Reel Collage 🎞️
                                </h3>

                                <div
                                    ref={collageRef}
                                    className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 rounded-xl border-4 border-gray-700 shadow-2xl"
                                >
                                    {/* Film strip holes */}
                                    <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-evenly">
                                        {Array.from({length: 8}).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-3 h-3 bg-black rounded-full border border-gray-600"
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-evenly">
                                        {Array.from({length: 8}).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-3 h-3 bg-black rounded-full border border-gray-600"
                                            ></div>
                                        ))}
                                    </div>

                                    {/* Film reel title */}
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                        memories
                                    </div>

                                    {/* Film strip content */}
                                    <div className="mx-6 space-y-3 py-4">
                                        {capturedPhotos.map((photo, index) => (
                                            <div
                                                key={index}
                                                className="relative bg-white p-2 rounded border-2 border-dashed border-gray-400 transform hover:scale-105 transition-all duration-300 cursor-grab active:cursor-grabbing"
                                                draggable
                                                style={{
                                                    rotate: `${(index % 2 === 0 ? 1 : -1) * Math.random() * 3}deg`,
                                                }}
                                            >
                                                {/* Vintage photo frame */}
                                                <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded shadow-lg">
                                                    <img
                                                        src={photo}
                                                        alt={`Film frame ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded shadow-md sepia-[20%] contrast-110 brightness-95"
                                                        style={{transform: "scaleX(-1)"}}
                                                    />

                                                    {/* Vintage photo effects */}
                                                    <div className="absolute inset-3 bg-gradient-to-br from-transparent via-transparent to-amber-900/10 rounded pointer-events-none"></div>

                                                    {/* Frame number */}
                                                    <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow">
                                                        {index + 1}
                                                    </div>

                                                    {/* Vintage stickers */}
                                                    <div className="absolute -top-2 -left-2 text-lg animate-pulse">
                                                        {["🌟", "❤️", "✨", "🎭", "🎨", "💫"][index % 6]}
                                                    </div>

                                                    {/* Date stamp effect */}
                                                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                                                        {new Date().toLocaleDateString("en-US", {
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            year: "2-digit",
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Film frame divider */}
                                                {index < capturedPhotos.length - 1 && (
                                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Film reel decorations */}
                                    <div className="absolute -top-4 -left-4 text-3xl animate-spin-slow">🎞️</div>
                                    <div className="absolute -top-4 -right-4 text-2xl animate-bounce">📷</div>
                                    <div className="absolute -bottom-4 -left-4 text-2xl animate-pulse">🎬</div>
                                    <div className="absolute -bottom-4 -right-4 text-2xl animate-bounce delay-500">
                                        🍿
                                    </div>
                                </div>

                                <Button
                                    onClick={handleDownloadCollage}
                                    className={`w-full mt-4 ${
                                        isDarkMode
                                            ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500"
                                            : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500"
                                    } text-white shadow-lg`}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Film Reel 🎞️
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default Index;
