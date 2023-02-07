import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { Bar } from "react-chartjs-2";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  plugins: {
    title: {
      display: true,
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};
type Props = {
  fractionCost: number;
  plusvalia: number;
  airbnbNightCost: number;
  percentageOccupationEstimation: number;
  years: number;
};

type Results = {
  capitalGains: number;
  cashflow: number;
  freeNights: number;
  price: number;
  cost: number;
  label: string;
};

const getResults = ({
  years,
  plusvalia,
  fractionCost,
  percentageOccupationEstimation,
  airbnbNightCost,
}: Props) => {
  let results: Results[] = [];
  let lastPrice = fractionCost;
  let nightCost = airbnbNightCost;
  for (let i = 0; i < years; i++) {
    const newBasePrice = lastPrice * (1 + plusvalia);

    results.push({
      label: "Año " + (i + 1),
      capitalGains: lastPrice * plusvalia,
      cashflow: (nightCost * 365 * percentageOccupationEstimation * 0.8) / 10,
      freeNights: nightCost * 7,
      price: newBasePrice,
      cost: i === 0 ? -fractionCost : 0,
    });

    lastPrice = lastPrice * (1 + plusvalia);
    nightCost = nightCost * (1 + plusvalia);
  }

  return results;
};

type ChartData = {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string }[];
};

const transformForChart = (results: Results[]) => {
  const chartData: ChartData = {
    labels: results.map((item) => item.label),
    datasets: [],
  };

  chartData.datasets.push({
    label: "Plusvalia",
    data: results.map((item) => item.capitalGains),
    backgroundColor: "#2bfcc8",
  });

  chartData.datasets.push({
    label: "Rentas",
    data: results.map((item) => item.cashflow),
    backgroundColor: "#2b8efc",
  });

  chartData.datasets.push({
    label: "Días Gratis",
    data: results.map((item) => item.freeNights),
    backgroundColor: "yellow",
  });

  return chartData;
};

const RoiCalculator = ({
  fractionCost = 390000,
  plusvalia = 0.12,
  airbnbNightCost = 3000,
  percentageOccupationEstimation = 0.62,
  years: numberOfYears = 5,
}: Props) => {
  const ref = useRef(null);

  const [years, setYears] = useState(numberOfYears);

  const results = getResults({
    years,
    plusvalia,
    fractionCost,
    percentageOccupationEstimation,
    airbnbNightCost,
  });

  const chartData = transformForChart(results);
  return (
    <div ref={ref}>
      <Card>
        <CardHeader
          subheader={
            <Typography sx={{ fontFamily: "Varela" }} variant="h5">
              Cálculo de retorno
            </Typography>
          }
        />
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => setYears(years > 1 ? years - 1 : years)}
              variant="outlined"
              startIcon={<RemoveIcon />}
            ></Button>

            <Typography sx={{ mx: 2 }}>{years} Años</Typography>
            <Button
              onClick={() => setYears(years + 1)}
              variant="outlined"
              endIcon={<AddIcon />}
            ></Button>
          </Box>
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            {" "}
            <Bar options={options} height={400} data={chartData} />
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {" "}
            <Bar options={options} data={chartData} />
          </Box>

          <Typography sx={{ fontFamily: "Varela" }} variant="h6">
            Resumen
          </Typography>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontFamily: "Varela" }}
          >
            Suma de rentas{" "}
            {formatter.format(
              results.reduce(
                (accumulator, currentValue) =>
                  accumulator + currentValue.cashflow,
                0
              )
            )}
            MXN
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "Varela" }}>
            Aumento de plusvalia{" "}
            {formatter.format(results[results.length - 1].capitalGains)} MXN
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "Varela" }}>
            Suma en días de vacaciones{" "}
            {formatter.format(
              results.reduce(
                (accumulator, currentValue) =>
                  accumulator + currentValue.freeNights,
                0
              )
            )}
            MXN
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography color="grey" variant="caption">
              {" "}
              Estas estimacions se hicieron con los siguientes datos:
            </Typography>
            <Typography color="grey" variant="caption">
              {" "}
              Plusvalia: {plusvalia}, Porcentage de ocupacion:{" "}
              {percentageOccupationEstimation}, costo de noche:{" "}
              {airbnbNightCost} MXN
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoiCalculator;
