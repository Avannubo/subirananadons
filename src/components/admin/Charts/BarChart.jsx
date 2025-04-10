'use client'; // Required for Chart.js since it uses client-side APIs

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function BarChart({ data, options }) {
    const defaultOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: options?.title || 'Bar Chart',
            },
        },
        ...options,
    };

    return <Bar data={data} options={defaultOptions} />;
}