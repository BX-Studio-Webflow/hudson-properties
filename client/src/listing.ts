import type { Listing } from "../../types/Listing";
import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";

const BASE_URL = "https://hudson-properties.vercel.app";

document.addEventListener("DOMContentLoaded", async () => {
  const listingSlugId = new URLSearchParams(window.location.search).get("id");
  const listingWrapper = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-wrapper]`,
  );
  const imageListDesktopWrapper = document.querySelector<HTMLDivElement>(
    `[dev-target=image-list-desktop-wrapper]`,
  );
  const listingLoader = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-loader]`,
  );
  const imageItemTabletWrap = document.querySelector<HTMLDivElement>(
    `[dev-target=image-item-tablet-wrap]`,
  );
  const imageItemTabletTemplate = document.querySelector<HTMLDivElement>(
    `[dev-target=image-item-tablet-template]`,
  );
  const listingTitle =
    document.querySelector<HTMLDivElement>(`[dev-target=title]`);
  const listingPrice =
    document.querySelector<HTMLDivElement>(`[dev-target=price]`);
  const listingFloorPlan = document.querySelector<HTMLLinkElement>(
    `[dev-target=floor-plan]`,
  );
  const listingDescription = document.querySelector<HTMLDivElement>(
    `[dev-target=description]`,
  );

  if (
    !listingWrapper ||
    !listingLoader ||
    !imageListDesktopWrapper ||
    !imageItemTabletWrap ||
    !imageItemTabletTemplate ||
    !listingTitle ||
    !listingPrice ||
    !listingFloorPlan ||
    !listingDescription
  ) {
    return console.error("Missing element");
  }

  if (!listingSlugId) {
    return console.error("Missing id");
  }

  injectStyles();

  try {
    const listing = await getListing(Number(listingSlugId));
    console.log({ listing });
    initPage({
      imageItemTabletTemplate,
      imageItemTabletWrap,
      imageListDesktopWrapper,
      listing,
      listingLoader,
      listingWrapper,
      listingDescription,
      listingFloorPlan,
      listingPrice,
      listingTitle,
    });
  } catch (error) {
    console.error("Something went wrong", error);
  }

  function injectStyles(): void {
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        [dev-target="image-list-desktop-wrapper"] {
          display: none !important;
        }
      }

      .lp-lightbox-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.25s ease;
      }
      .lp-lightbox-overlay.is-open { opacity: 1; }
      .lp-lightbox-img {
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        display: block;
        border-radius: 4px;
        user-select: none;
      }
      .lp-lightbox-close {
        position: absolute;
        top: 20px;
        right: 24px;
        background: none;
        border: none;
        color: #fff;
        font-size: 28px;
        cursor: pointer;
        z-index: 10;
        line-height: 1;
        padding: 4px 8px;
        opacity: 0.85;
        transition: opacity 0.15s;
      }
      .lp-lightbox-close:hover { opacity: 1; }

      .swiper-button-next svg, .swiper-button-prev svg {
      display: none;
      }
      .swiper-button-next:after, .swiper-button-prev:after{
      color: #fff;
      }
      .swiper-pagination-fraction {
        color: #fff;
}


    `;
    document.head.appendChild(style);
  }

  function initPage({
    listing,
    listingWrapper,
    listingLoader,
    imageListDesktopWrapper,
    imageItemTabletWrap,
    imageItemTabletTemplate,
    listingTitle,
    listingPrice,
    listingFloorPlan,
    listingDescription,
  }: {
    listing: Listing;
    listingWrapper: HTMLElement;
    listingLoader: HTMLElement;
    imageListDesktopWrapper: HTMLElement;
    imageItemTabletWrap: HTMLElement;
    imageItemTabletTemplate: HTMLElement;
    listingTitle: HTMLElement;
    listingPrice: HTMLElement;
    listingFloorPlan: HTMLLinkElement;
    listingDescription: HTMLElement;
  }) {
    const photos = listing.photos;

    // ── Desktop: Swiper gallery ──
    imageListDesktopWrapper.innerHTML = `
      <div class="swiper lp-desktop-swiper">
        <div class="swiper-wrapper"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
        <div class="swiper-pagination"></div>
      </div>
    `;

    const desktopSwiperEl =
      imageListDesktopWrapper.querySelector<HTMLElement>(".lp-desktop-swiper")!;
    const desktopSwiperWrapper =
      desktopSwiperEl.querySelector<HTMLElement>(".swiper-wrapper")!;

    photos.forEach((photo) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      const img = document.createElement("img");
      img.src = photo.original;
      img.srcset = "";
      img.alt = "";
      slide.appendChild(img);
      desktopSwiperWrapper.appendChild(slide);
    });

    new Swiper(desktopSwiperEl, {
      modules: [Navigation, Pagination],
      navigation: {
        nextEl: desktopSwiperEl.querySelector<HTMLElement>(
          ".swiper-button-next",
        )!,
        prevEl: desktopSwiperEl.querySelector<HTMLElement>(
          ".swiper-button-prev",
        )!,
      },
      pagination: {
        el: desktopSwiperEl.querySelector<HTMLElement>(".swiper-pagination")!,
        type: "fraction",
      },
    });

    // Click any image to open it in the lightbox
    desktopSwiperWrapper.addEventListener("click", (e) => {
      const img = (e.target as HTMLElement).closest<HTMLImageElement>("img");
      if (!img) return;
      openLightbox(img.src);
    });

    // ── Mobile/Tablet: Webflow slider (unchanged) ──
    imageItemTabletWrap.innerHTML = "";
    photos.forEach((photo) => {
      const imageItemTablet = imageItemTabletTemplate.cloneNode(
        true,
      ) as HTMLElement;
      const imageTablet = imageItemTablet.querySelector<HTMLImageElement>(
        `[dev-target=listing-image]`,
      );
      if (!imageTablet)
        return console.error("dev-target=listing-image not found");
      imageTablet.src = photo.original;
      imageTablet.srcset = "";
      imageItemTabletWrap.appendChild(imageItemTablet);
    });

    window.Webflow.require("slider").redraw();
    window.dispatchEvent(new Event("resize"));

    listingTitle.innerText = `${listing.bedrooms} BED, ${listing.bathrooms} BATH`;
    listingPrice.innerText = `$${Number(listing.price).toLocaleString()}`;
    listingFloorPlan.href = `#`;
    listingDescription.textContent = listing.description;

    toggleHideElement({ element: listingLoader, toggle: "hide" });
    toggleHideElement({ element: listingWrapper, toggle: "show" });
  }

  function openLightbox(src: string): void {
    document.querySelector(".lp-lightbox-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "lp-lightbox-overlay";

    const closeBtn = document.createElement("button");
    closeBtn.className = "lp-lightbox-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = "&#x2715;";

    const img = document.createElement("img");
    img.src = src;
    img.className = "lp-lightbox-img";

    overlay.appendChild(closeBtn);
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const close = () => {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      overlay.addEventListener("transitionend", () => overlay.remove(), {
        once: true,
      });
    };

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", onEsc);
      }
    };
    document.addEventListener("keydown", onEsc);

    requestAnimationFrame(() => overlay.classList.add("is-open"));
  }

  async function getListing(id: number) {
    try {
      const response = await fetch(`${BASE_URL}/api/listings/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }
      const job: Listing = await response.json();
      return job;
    } catch (error) {
      console.error("Error fetching job:", error);
      throw error;
    }
  }

  function toggleHideElement({
    element,
    toggle,
  }: {
    element: HTMLElement;
    toggle: "show" | "hide";
  }) {
    if (toggle === "show") {
      element.setAttribute("dev-hide", "false");
    } else {
      element.setAttribute("dev-hide", "true");
    }
  }
});
