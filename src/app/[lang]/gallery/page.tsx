import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { alternatesFor } from '@/lib/seo';
import { Container, Section, SectionHead } from '@/components/ui';
import { GALLERY_PHOTOS } from '@/lib/photos';

export async function generateMetadata(props: PageProps<'/[lang]/gallery'>): Promise<Metadata> {
  const { lang } = await props.params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nav.gallery, description: dict.gallery.lede, alternates: alternatesFor(lang, '/gallery') };
}

export default async function GalleryPage(props: PageProps<'/[lang]/gallery'>) {
  const { lang } = await props.params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <Section>
      <Container>
        <SectionHead
          kicker={dict.gallery.kicker}
          title={dict.gallery.title}
          lede={dict.gallery.lede}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GALLERY_PHOTOS.map((photo, i) => (
            <figure
              key={photo.key}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-2"
            >
              <Image
                src={photo.src}
                alt=""
                fill
                loading={i < 4 ? 'eager' : 'lazy'}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
