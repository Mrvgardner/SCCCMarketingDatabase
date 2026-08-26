import { Navigate, Outlet, useParams } from "react-router-dom";
import TripTabBar from "../../components/trip/TripTabBar";
import { useTripEvent } from "./useTripEvent";

export default function TripLayout() {
  const { eventId } = useParams();
  const trip = useTripEvent(eventId);

  if (!trip.event) {
    return <Navigate to="/events" replace />;
  }

  return (
    // Dark canvas, 18px screen padding, 62px top (clear of the status bar) and
    // room at the bottom for the fixed tab bar.
    <div className="min-h-screen bg-[#05101f] text-white">
      <main
        className="mx-auto max-w-lg px-[18px] pb-32"
        style={{ paddingTop: "max(62px, calc(env(safe-area-inset-top) + 22px))" }}
      >
        <Outlet context={trip} />
      </main>
      <TripTabBar eventId={eventId} />
    </div>
  );
}
