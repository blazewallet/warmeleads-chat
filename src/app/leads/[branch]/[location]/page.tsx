import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { 
  cities, 
  provinces, 
  branches, 
  getLocationMetadata, 
  generateLocationSlug,
  type City,
  type Province,
  type Branch
} from "@/data/locations";

interface LocalLeadsPageProps {
  params: {
    branch: string;
    location: string;
  };
}

// Generate all possible combinations for static generation
export async function generateStaticParams() {
  const params: Array<{ branch: string; location: string }> = [];

  branches.forEach(branch => {
    // Add city pages
    cities.forEach(city => {
      params.push({
        branch: branch.slug,
        location: city.slug
      });
    });

    // Add province pages
    provinces.forEach(province => {
      params.push({
        branch: branch.slug,
        location: province.slug
      });
    });
  });

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: LocalLeadsPageProps): Promise<Metadata> {
  const branch = branches.find(b => b.slug === params.branch);
  const city = cities.find(c => c.slug === params.location);
  const province = provinces.find(p => p.slug === params.location);
  
  const location = city || province;
  
  if (!branch || !location) {
    return {
      title: "Pagina niet gevonden | WarmeLeads",
    };
  }

  const locationType = city ? 'city' : 'province';
  const metadata = getLocationMetadata(branch, location, locationType);

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://www.warmeleads.eu/leads/${params.branch}/${params.location}`,
    },
    openGraph: {
      title: metadata.ogTitle,
      description: metadata.ogDescription,
      url: `https://www.warmeleads.eu/leads/${params.branch}/${params.location}`,
      siteName: "WarmeLeads",
      locale: "nl_NL",
      type: "website",
      images: [
        {
          url: metadata.ogImage,
          width: 1200,
          height: 630,
          alt: `${metadata.schemaName} - WarmeLeads`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@warmeleads",
      creator: "@warmeleads",
      title: metadata.ogTitle,
      description: metadata.ogDescription,
      images: [metadata.ogImage],
    },
  };
}

export default function LocalLeadsPage({ params }: LocalLeadsPageProps) {
  const branch = branches.find(b => b.slug === params.branch);
  const city = cities.find(c => c.slug === params.location);
  const province = provinces.find(p => p.slug === params.location);
  
  const location = city || province;
  
  if (!branch || !location) {
    redirect('/');
  }

  // Redirect to main branch page with location parameter
  redirect(`/leads-${params.branch}?location=${params.location}`);
}
