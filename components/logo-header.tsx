"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function LogoHeader() {
    const { resolvedTheme } = useTheme(); // resolvedTheme gives system-aware theme
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const logoSrc =
        resolvedTheme === "dark"
        ? "/assets/logo-dark.png"
        : "/assets/logo-light.png";
    return (
        <div className="relative z-10 flex items-center justify-center gap-3">
            <Image src={logoSrc} width={350} height={350} alt="Logo" />
        </div>
    );
}

export default LogoHeader;
