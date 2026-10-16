import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { AirportPhoto } from '@/lib/airport-photos';
import PhotosGallery, { type GalleryPhoto } from './PhotosGallery';

/**
 * "Airport photos" section: the airport's real-world pictures, one figure each
 * with an editorial caption and a credit line back to the page the photo was
 * taken from (provenance lives in public/photos/manifest.json). Renders only
 * when the repo actually holds photos for the code, so the section is absent
 * from every airport that has not had a photo batch downloaded yet.
 */
export default function PhotosSection({
  locale,
  name,
  iata,
  photos,
}: {
  locale: Locale;
  /** Localized airport name, for alt text and the zoom label. */
  name: string;
  iata: string;
  photos: AirportPhoto[];
}) {
  const t = getMessages(locale);

  const gallery: GalleryPhoto[] = photos.map((photo, i) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    // The written caption doubles as the image's alt text; the fallback names
    // the airport and the photo's position instead of repeating the file name.
    alt: photo.caption ?? t.airport.photosAlt(name, iata, i + 1),
    caption: photo.caption,
    credit: photo.credit.host
      ? {
          label: t.airport.photosCredit(photo.credit.host),
          url: photo.credit.url,
          title: photo.credit.title,
        }
      : null,
    zoomLabel: t.airport.photosZoom(name, i + 1),
  }));

  return (
    <section className="ap-extra" id="photos">
      <div className="section-head">
        <div>
          <div className="section-kicker">{t.airport.photosKicker}</div>
          <h2 className="section-title">
            {t.airport.photosTitle}
            <span className="en">{t.airport.photosEn}</span>
          </h2>
          <p className="sec-sub">{t.airport.photosSub}</p>
        </div>
      </div>
      <PhotosGallery
        photos={gallery}
        label={t.airport.photosTitle}
        closeLabel={t.airport.zoomClose}
        zoomInLabel={t.airport.zoomIn}
        zoomOutLabel={t.airport.zoomOut}
      />
    </section>
  );
}
