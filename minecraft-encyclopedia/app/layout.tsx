import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'MINE!!! · Minecraft illustrated encyclopedia', description: 'Explore a versioned Minecraft block registry, crafting recipes and survival field notes. Java 1.21.4 with explicit research coverage.' };
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
