import { useState, type FormEvent } from "react";
import { Button, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { geocodeAddress, GeocodingError } from "../../lib/geocoding";
import type { Location } from "../../types/location";

type AddressSearchControlProps = {
  onLocationResolved: (location: Location) => void;
  onError: (message: string) => void;
};

export function AddressSearchControl({ onLocationResolved, onError }: AddressSearchControlProps) {
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedAddress = address.trim();
    if (!trimmedAddress) return;

    setIsSearching(true);
    try {
      const location = await geocodeAddress(trimmedAddress);
      if (!location) {
        onError("No results found for that address.");
        return;
      }
      onLocationResolved(location);
    } catch (error) {
      onError(
        error instanceof GeocodingError ? error.message : "Something went wrong searching for that address.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField.Root
        placeholder="Enter an address"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        color="brown"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
        <TextField.Slot>
          <Button
            type="submit"
            size="1"
            variant="ghost"
            color="brown"
            className="search-submit-button"
            loading={isSearching}
            disabled={!address.trim()}
          >
            Search
          </Button>
        </TextField.Slot>
      </TextField.Root>
    </form>
  );
}
