import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'WarmeLeads';
    const description = searchParams.get('description') || 'Dé specialist in hoogwaardige leadgeneratie';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#6B21A8',
            background: 'linear-gradient(135deg, #6B21A8 0%, #DB2777 50%, #F97316 100%)',
            padding: '80px',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '120px',
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: '-0.05em',
              }}
            >
              🔥 WarmeLeads
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '60px',
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
              maxWidth: '1000px',
              lineHeight: 1.2,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            {title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '20px 40px',
              borderRadius: '50px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: 'white',
                fontWeight: 600,
              }}
            >
              ✅ Verse Leads • 🎯 Exclusief & Gedeeld • 🚀 Direct Leverbaar
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}


