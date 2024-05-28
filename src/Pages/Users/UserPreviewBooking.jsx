import { useEffect, useState } from "react";
import { FaCheckCircle, FaCommentAlt, FaTimesCircle } from "react-icons/fa";
import TopBar from "../../components/Sample/TopBar";
import Footer from "../../components/Sample/Footer";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Navigate, useNavigate } from "react-router";
import {
  cancelBooking,
  userBookingPreview,
} from "../../service/User/UserService";
import Swal from "sweetalert2";

const UserPreviewBooking = () => {
  const user = localStorage.getItem("userAccessToken");
  const [bookingData, setBookingData] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showLatestBookings, setShowLatestBookings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userBookingPreview();
        console.log("Fetching the bookings", response);

        setBookingData(response.data.data);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };
    fetchData();
  }, []);

  if (!user) return <Navigate to="/" />;

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const sortedBookings = [...bookingData].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.amount - b.amount;
    } else {
      return b.amount - a.amount;
    }
  });

  const filteredBookings = showLatestBookings
    ? sortedBookings.slice().reverse()
    : sortedBookings;

  const renderSeal = (status) => {
    if (status === "confirmed") {
      return (
        <div className="absolute top-2 left-2 flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full">
          <FaCheckCircle className="text-green-500 mr-1" />
          <span className="text-sm font-semibold">Confirmed</span>
        </div>
      );
    } else if (status === "canceled") {
      return (
        <div className="absolute top-2 left-2 flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full">
          <FaTimesCircle className="text-red-500 mr-1" />
          <span className="text-sm font-semibold">Canceled</span>
        </div>
      );
    }
    return null;
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const imageStyle = {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "10px",
  };

  const handleCancel = async (bookingId) => {
    console.log(bookingId);
    const confirmCancel = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    });

    if (confirmCancel.isConfirmed) {
      try {
        const response = await cancelBooking(bookingId);
        console.log("response in cancel booking", response);
        Swal.fire("Canceled!", "Your booking has been canceled.", "success");
        setBookingData((prevData) =>
          prevData.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "canceled" }
              : booking
          )
        );
        setTimeout(() => {
          navigate("/userprofile");
        }, 1500);
      } catch (err) {
        console.log("Error in cancel booking", err);
        Swal.fire(
          "Error!",
          "Failed to cancel booking. Please try again.",
          "error"
        );
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <TopBar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between">
          <div>
            <label htmlFor="sort-order" className="mr-2 font-medium">
              Sort By:
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-2 py-1 rounded-md border border-gray-300"
            >
              <option value="asc">Low to High Amount</option>
              <option value="desc">High to Low Amount</option>
            </select>
          </div>
          <div>
            <label htmlFor="latest-bookings" className="mr-2 font-medium">
              Show:
            </label>
            <select
              id="latest-bookings"
              value={showLatestBookings}
              onChange={(e) => setShowLatestBookings(e.target.value === "true")}
              className="px-2 py-1 rounded-md border border-gray-300"
            >
              <option value={false}>All Bookings</option>
              <option value={true}>Latest Bookings</option>
            </select>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="relative p-4 border-b border-gray-200 last:border-b-0"
            >
              {renderSeal(booking.status)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-5">
                <div>
                  <Slider {...sliderSettings}>
                    {booking.image.map((imageUrl, index) => (
                      <div key={index}>
                        <img
                          src={`${imageUrl}`}
                          alt={`Room ${index + 1}`}
                          style={imageStyle}
                          className="w-full h-64 rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Room Type: {booking.roomType}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Booking Date:{" "}
                          {`${booking.bookingDate}`.toString().split("T")[0]}
                        </p>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Check-In Date:{" "}
                          {`${booking.checkInDate}`.toString().split("T")[0]}
                        </p>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Check-Out Date:{" "}
                          {`${booking.checkOutDate}`.toString().split("T")[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Amount: {booking.amount}
                        </p>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Adults: {booking.adults}
                        </p>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Children: {booking.children}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-2">
                      Status: {booking.status}
                    </p>
                    <p className="text-sm text-red-600 mb-4">
                      Address: {booking.Adress}
                    </p>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className={`py-2 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        booking.status === "cancel"
                          ? "bg-red-500 text-white opacity-50 cursor-not-allowed :"
                          : "bg-red-500 hover:bg-red-700  text-white"
                      }`}
                      disabled={booking.status === "cancel"}
                    >
                      {booking.status === "canceled"
                        ? "Booking Canceled"
                        : "Cancel Booking"}
                    </button>
                    <button
                      onClick={() =>
                        navigate("/chat", {
                          state: {
                            providerId: booking.providerId,
                            bookingId: booking._id,
                            roomId: booking.roomId,
                            userId: booking.userId,
                          },
                        })
                      }
                      className="py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                    >
                      <FaCommentAlt className="mr-2" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserPreviewBooking;
