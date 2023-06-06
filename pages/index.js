import axios from "axios";
import { useEffect, useReducer, useRef, useState } from "react";
import { toast } from "react-toastify";

const genereteProperText = (destination, date) => {
  if (destination === "tehran") {
    return `{"From":161,"To":1,"DepartureDate":"${new Date(date)
      .toISOString()
      .slice(
        0,
        new Date(date).toISOString().lastIndexOf(".")
      )}","TicketType":1,"IsExclusiveCompartment":false,"PassengerCount":1,"ReturnDate":null,"ServiceType":null,"Channel":1,"AvailableTargetType":null,"Requester":null,"UserId":504604002,"OnlyWithHotel":false,"ForceUpdate":null}`;
  } else {
    return `{"From":1,"To":161,"DepartureDate":"${new Date(date)
      .toISOString()
      .slice(
        0,
        new Date(date).toISOString().lastIndexOf(".")
      )}","TicketType":1,"IsExclusiveCompartment":false,"PassengerCount":1,"ReturnDate":null,"ServiceType":null,"Channel":1,"AvailableTargetType":null,"Requester":null,"UserId":504604002,"OnlyWithHotel":false,"ForceUpdate":null}`;
  }
};
export default function Home() {
  const [times, setTimes] = useState([]);
  const [details, setDetails] = useState({
    selectedTime: "",
    destination: "tehran",
    date: new Date().toISOString().substring(0, 10),
  });
  const [counter, setCounter] = useState(0);
  const [available, setAvailable] = useState([]);
  const getTimesHandler = async () => {
    try {
      const { data } = await axios.get(
        `https://ws.alibaba.ir/api/v2/train/available/${btoa(
          genereteProperText(details?.destination, details?.date)
        )}`
      );
      const {
        result: { departing },
      } = data;
      const fetchedTimes = departing.map((t) =>
        t.departureDateTime.split("T")[1].slice(0, 5)
      );
      setTimes(fetchedTimes);
    } catch (error) {
      toast.error(error?.response?.data?.error?.message);
    }
  };
  const soundRef = useRef();
  const testSoundHandler = () => {
    soundRef.current.play();
  };

  useEffect(() => {
    let timerId;
    (async () => {
      if (counter > 0) {
        try {
          timerId = setTimeout(async () => {
            const { data } = await axios.get(
              `https://ws.alibaba.ir/api/v2/train/available/${btoa(
                genereteProperText(details?.destination, details?.date)
              )}`
            );

            const {
              result: { departing },
            } = data;
            const availableTickets = departing.filter((t) => t.seat > 0);
            setAvailable(availableTickets);
            const selectedTicket = availableTickets.find((t) =>
              t.departureDateTime.includes(details.selectedTime)
            );
            if (selectedTicket) {
              soundRef.current.play();
            }
            setCounter((prev) => prev + 1);
          }, 20000);
        } catch (error) {
          toast.error(error?.response?.data?.error?.message);
          toast.error(
            "در صورت بازماندن این صفحه ، پس از آن به صورت خودکار عملیات شکار آغاز خواهد شد"
          );
        }
      }
    })();
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [counter]);

  return (
    <main className="container mx-auto md:w-1/2 md:max-w-lg flex flex-col items-center p-8 gap-6">
      <div className="flex w-full justify-between items-center">
        <span>تاریخ</span>
        <input
          type="date"
          className="border border-indigo-500 p-2 rounded-md bg-white outline-none"
          value={details?.date}
          onChange={(e) => setDetails({ ...details, date: e.target.value })}
        />
      </div>
      <div className="flex rounded-md overflow-hidden justify-center mx-auto">
        <div
          className={`text-center px-7 py-2 ${
            details?.destination === "tehran"
              ? " bg-indigo-400 text-white"
              : "bg-white border-l border-indigo-300"
          }`}
          onClick={() => {
            setDetails({ ...details, destination: "tehran" });
          }}
        >
          قم به تهران
        </div>
        <div
          className={`text-center px-7 py-2 ${
            details?.destination === "qom"
              ? "bg-indigo-400 text-white"
              : " bg-white border-l border-indigo-300"
          }`}
          onClick={() => {
            setDetails({ ...details, destination: "qom" });
          }}
        >
          تهران به قم
        </div>
      </div>
      <button
        onClick={getTimesHandler}
        className="w-full px-7 py-2 bg-indigo-500 text-white rounded-md cursor-pointer disabled:bg-slate-400"
      >
        دریافت ساعت ها
      </button>
      <button
        onClick={testSoundHandler}
        className="w-full px-7 py-2 bg-indigo-500 text-white rounded-md cursor-pointer disabled:bg-slate-400"
      >
        تست صدا
      </button>
      <div className="flex flex-wrap gap-y-2">
        {times.map((t) => (
          <div
            key={t}
            onClick={() => {
              setDetails({ ...details, selectedTime: t });
            }}
            className={`text-center px-3 py-2 ${
              t === details?.selectedTime
                ? "bg-indigo-400 text-white"
                : "bg-white "
            } border-l border-indigo-300`}
          >
            {t}
          </div>
        ))}
      </div>
      <button
        disabled={!details.selectedTime || counter > 0}
        className="w-full px-7 py-2 bg-indigo-600 text-white rounded-md cursor-pointer disabled:bg-slate-400"
        onClick={() => setCounter((prev) => prev + 1)}
      >
        {counter > 0 ? "در حال شکار" : "آغاز شکار "}{" "}
      </button>
      <div className="w-full flex justify-between">
        <div>تعداد درخواست ها</div>
        <span>{counter}</span>
      </div>
      <h3 className="self-start">بلیط های موجود</h3>
      <div className="w-full flex flex-col self-start">
        {available.map((t) => (
          <div key={t.departureDateTime} className="flex justify-between">
            <div className="flex gap-x-2">
              <span>تعداد</span>
              <span>{t?.seat}</span>
            </div>
            <span>{t.departureDateTime.split("T")[1].slice(0, 5)}</span>
          </div>
        ))}
        <audio
          style={{ display: "none" }}
          ref={soundRef}
          controls
          src="./beep.wav"
        >
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </div>
    </main>
  );
}
