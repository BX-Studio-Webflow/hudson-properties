import type { Listing } from "../../types/Listing";
const BASE_URL = "https://hudson-properties.vercel.app";

document.addEventListener("DOMContentLoaded", async () => {
  const listingSlugId = new URLSearchParams(window.location.search).get("id");
  const listingWrapper = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-wrapper]`
  );
  const imageListDesktopWrapper = document.querySelector<HTMLDivElement>(
    `[dev-target=image-list-desktop-wrapper]`
  );
  const listingLoader = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-loader]`
  );
  const imageItemDesktopTemplate = document.querySelector<HTMLDivElement>(
    `[dev-target=image-item-desktop-template]`
  );
  const imageItemTabletWrap = document.querySelector<HTMLDivElement>(
    `[dev-target=image-item-tablet-wrap]`
  );
  const imageItemTabletTemplate = document.querySelector<HTMLDivElement>(
    `[dev-target=image-item-tablet-template]`
  );
  const listingTitle =
    document.querySelector<HTMLDivElement>(`[dev-target=title]`);
  const listingPrice =
    document.querySelector<HTMLDivElement>(`[dev-target=price]`);
  //   const listingContactUs = document.querySelector<HTMLLinkElement>(
  //     `[dev-target=contact-us]`
  //   );
  const listingFloorPlan = document.querySelector<HTMLLinkElement>(
    `[dev-target=floor-plan]`
  );
  const listingDescription = document.querySelector<HTMLDivElement>(
    `[dev-target=description]`
  );
  if (
    !listingWrapper ||
    !listingLoader ||
    !imageListDesktopWrapper ||
    !imageItemDesktopTemplate ||
    !imageItemTabletWrap ||
    !imageItemTabletTemplate ||
    !listingTitle ||
    !listingPrice ||
    // !listingContactUs ||
    !listingFloorPlan ||
    !listingDescription
  ) {
    return console.error("Missing element");
  }

  if (!listingSlugId) {
    return console.error("Missing id");
  }

  try {
    const listing = await getListing(Number(listingSlugId));
    console.log({ listing });
    initPage({
      imageItemDesktopTemplate,
      imageItemTabletTemplate,
      imageItemTabletWrap,
      imageListDesktopWrapper,
      listing,
      listingLoader,
      listingWrapper,
      //   listingContactUs,
      listingDescription,
      listingFloorPlan,
      listingPrice,
      listingTitle,
    });
  } catch (error) {
    console.error("Something went wrong", error);
  }

  function initPage({
    listing,
    listingWrapper,
    listingLoader,
    imageListDesktopWrapper,
    imageItemDesktopTemplate,
    imageItemTabletWrap,
    imageItemTabletTemplate,
    listingTitle,
    listingPrice,
    // listingContactUs,
    listingFloorPlan,
    listingDescription,
  }: {
    listing: Listing;
    listingWrapper: HTMLElement;
    listingLoader: HTMLElement;
    imageListDesktopWrapper: HTMLElement;
    imageItemDesktopTemplate: HTMLElement;
    imageItemTabletWrap: HTMLElement;
    imageItemTabletTemplate: HTMLElement;
    listingTitle: HTMLElement;
    listingPrice: HTMLElement;
    // listingContactUs: HTMLLinkElement;
    listingFloorPlan: HTMLLinkElement;
    listingDescription: HTMLElement;
  }) {
    const desktopPhotos = listing.photos;
    const tabletPhotos = listing.photos;

    imageListDesktopWrapper.innerHTML = "";
    imageItemTabletWrap.innerHTML = "";
    desktopPhotos.map((photo) => {
      const imageItemDesktop = imageItemDesktopTemplate.cloneNode(
        true
      ) as HTMLElement;
      const imageDesktop = imageItemDesktop.querySelector<HTMLImageElement>(
        `[dev-target=listing-image]`
      );
      if (!imageDesktop)
        return console.error("dev-target=listing-image not found");
      imageDesktop.src = photo.original;
      imageDesktop.srcset = "";
      imageListDesktopWrapper.appendChild(imageItemDesktop);
    });

    tabletPhotos.map((photo) => {
      const imageItemTablet = imageItemTabletTemplate.cloneNode(
        true
      ) as HTMLElement;
      const imageTablet = imageItemTablet.querySelector<HTMLImageElement>(
        `[dev-target=listing-image]`
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
    // listingContactUs.href = `#`;
    listingFloorPlan.href = `#`;
    listingDescription.textContent = listing.description;

    toggleHideElement({ element: listingLoader, toggle: "hide" });
    toggleHideElement({ element: listingWrapper, toggle: "show" });
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
