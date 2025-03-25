import type { Listings } from "../../types/Listings";
document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "https://hudson-properties.vercel.app";
  const listingLoader = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-loader]`
  );
  const listingList = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-list]`
  );
  const listingItemTemplate = document.querySelector<HTMLDivElement>(
    `[dev-target=listing-item-template]`
  );
  const listingForm = document.querySelector<HTMLFormElement>(
    `[dev-target=listing-form]`
  );
  const emptyState = document.querySelector<HTMLDivElement>(
    `[dev-target=empty-state]`
  );

  let currentUnitType = "";
  let minListing = 0;
  let maxListing = Infinity;
  let listingSearch = "";
  let globalListings: Listings | null = null;

  if (
    !listingItemTemplate ||
    !listingList ||
    !listingLoader ||
    !listingForm ||
    !emptyState
  ) {
    return console.error("Missing required elements");
  }

  try {
    const listings = await getAllProperties();
    globalListings = listings;
    console.log({ listings });
    listingsInit({
      listings,
      emptyState,
      listingItemTemplate,
      listingList,
      listingLoader,
    });
    filterInit({
      listingForm,
      listingItemTemplate,
      listingList,
      listingLoader,
      emptyState,
    });
  } catch (error) {}

  function listingsInit({
    listings,
    listingList,
    listingLoader,
    listingItemTemplate,
    emptyState,
  }: {
    listings: Listings;
    listingList: HTMLDivElement;
    listingLoader: HTMLDivElement;
    listingItemTemplate: HTMLDivElement;
    emptyState: HTMLDivElement;
  }) {
    listingList.innerHTML = "";
    listings.items.forEach((listing) => {
      const listingItem = listingItemTemplate.cloneNode(
        true
      ) as HTMLAnchorElement;
      const listingTitle =
        listingItem.querySelector<HTMLDivElement>(`[dev-target=title]`);
      const listingPrice =
        listingItem.querySelector<HTMLDivElement>(`[dev-target=price]`);
      const listingType = listingItem.querySelector<HTMLDivElement>(
        `[dev-target=listing-type]`
      );
      const listingImage =
        listingItem.querySelector<HTMLImageElement>(`[dev-target=image]`);

      if (!listingTitle || !listingImage || !listingPrice || !listingType) {
        return console.error("Missing listing item elements");
      }
      listingItem.href = `/property?id=${listing.id}`;
      listingImage.src = listing.photos[0].original;
      listingTitle.textContent = `${listing.bedrooms} BED, ${listing.bathrooms} BATH`;
      listingPrice.textContent = Number(listing.price).toLocaleString();
      listingType.textContent = listing.property_type;

      listingList.appendChild(listingItem);
    });
    if (listings.items.length === 0) {
      toggleHideElement({ element: emptyState, toggle: "show" });
    } else {
      toggleHideElement({ element: emptyState, toggle: "hide" });
    }
    toggleHideElement({ element: listingLoader, toggle: "hide" });
    toggleHideElement({ element: listingList, toggle: "show" });
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

  async function getAllProperties() {
    try {
      const response = await fetch(`${BASE_URL}/api/listings`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const listings: Listings = await response.json();
      return listings;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  }

  function filterInit({
    listingForm,
    listingItemTemplate,
    listingList,
    listingLoader,
    emptyState,
  }: {
    listingForm: HTMLFormElement;
    listingList: HTMLDivElement;
    listingLoader: HTMLDivElement;
    listingItemTemplate: HTMLDivElement;
    emptyState: HTMLDivElement;
  }) {
    const searchInput = listingForm.querySelector<HTMLInputElement>(
      `[dev-target=listing-search]`
    );
    const unitTypeSelect = listingForm.querySelector<HTMLSelectElement>(
      `[dev-target=listing-unit]`
    );
    const minPriceSelect = listingForm.querySelector<HTMLSelectElement>(
      `[dev-target=listing-min-price]`
    );
    const maxPriceSelect = listingForm.querySelector<HTMLSelectElement>(
      `[dev-target=listing-max-price]`
    );

    searchInput?.addEventListener("input", (e) => {
      listingSearch = (e.target as HTMLInputElement).value;
      console.log({ listingSearch });
      if (globalListings) {
        const filteredListing = filterListings({
          listings: globalListings,
          maxPrice: maxListing,
          minPrice: minListing,
          search: listingSearch,
          unitType: currentUnitType,
        });
        listingsInit({
          listings: filteredListing,
          listingItemTemplate,
          listingList,
          listingLoader,
          emptyState,
        });
      }
    });

    maxPriceSelect?.addEventListener("change", (e) => {
      const value = (e.target as HTMLSelectElement).value;
      maxListing = value === "" ? Infinity : Number(value);
      console.log({ maxListing });
      if (globalListings) {
        const filteredListing = filterListings({
          listings: globalListings,
          maxPrice: maxListing,
          minPrice: minListing,
          search: listingSearch,
          unitType: currentUnitType,
        });
        listingsInit({
          listings: filteredListing,
          listingItemTemplate,
          listingList,
          listingLoader,
          emptyState,
        });
      }
    });
    minPriceSelect?.addEventListener("change", (e) => {
      minListing = Number((e.target as HTMLSelectElement).value);
      console.log({ minListing });
      if (globalListings) {
        const filteredListing = filterListings({
          listings: globalListings,
          maxPrice: maxListing,
          minPrice: minListing,
          search: listingSearch,
          unitType: currentUnitType,
        });
        listingsInit({
          listings: filteredListing,
          listingItemTemplate,
          listingList,
          listingLoader,
          emptyState,
        });
      }
    });
    unitTypeSelect?.addEventListener("change", (e) => {
      currentUnitType = (e.target as HTMLSelectElement).value;
      console.log({ currentUnitType });
      if (globalListings) {
        const filteredListing = filterListings({
          listings: globalListings,
          maxPrice: maxListing,
          minPrice: minListing,
          search: listingSearch,
          unitType: currentUnitType,
        });
        listingsInit({
          listings: filteredListing,
          listingItemTemplate,
          listingList,
          listingLoader,
          emptyState,
        });
      }
    });
  }

  function filterListings({
    listings,
    search,
    unitType,
    minPrice,
    maxPrice,
  }: {
    listings: Listings;
    search: string;
    unitType: string;
    minPrice: number;
    maxPrice: number;
  }): Listings {
    return {
      ...listings,
      items: listings.items.filter((listing) => {
        const matchesSearch =
          search === "" ||
          listing.property_type.toLowerCase().includes(search.toLowerCase());

        const matchesUnitPrice =
          unitType === "" ||
          unitType.toLowerCase().trim() ===
            listing.property_type.toLowerCase().trim();

        const matchesMinPrice = Number(listing.price) >= minPrice;

        const matchesMaxPrice = Number(listing.price) <= maxPrice;

        return (
          matchesSearch &&
          matchesMinPrice &&
          matchesMaxPrice &&
          matchesUnitPrice
        );
      }),
    };
  }
});
