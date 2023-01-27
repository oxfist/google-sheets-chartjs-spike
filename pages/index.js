import Head from 'next/head';

import HtmlTableToJson from 'html-table-to-json';

import { promises as fs } from 'fs';

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
import autocolors from 'chartjs-plugin-autocolors';

import styles from '../styles/Home.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  autocolors
);

const options = {
  locale: 'es-CL',
  plugins: {
    legend: {
      position: 'top',
    },
    autocolors: {
      mode: 'dataset',
      offset: 12,
    },
  },
  responsive: true,
  minBarLength: 3,
  scales: {
    y: {
      stacked: true,
      title: {
        display: true,
        text: 'Cantidad de personas',
      },
    },
  },
};

export default function Home({ title, data }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{`${title}`}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{`${title}`}</h1>
        <div className={styles.graphContainer}>
          <Bar
            options={{
              ...options,
              plugins: {
                title: {
                  text: 'Trabajadoras y trabajadores por subárea / región',
                  display: true,
                },
              },
              scales: {
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: 'Región de Chile',
                  },
                },
              },
            }}
            data={data[0]}
          />
        </div>
        <div className={styles.graphContainer}>
          <Bar
            options={{
              ...options,
              plugins: {
                title: {
                  text: 'Trabajadoras y trabajadores por subárea / tipo de contrato',
                  display: true,
                },
              },
              scales: {
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: 'Tipo de contrato',
                  },
                },
              },
            }}
            data={data[1]}
          />
        </div>
      </main>
    </div>
  );
}

function buildGraphData(jsonTable) {
  const xLabels = [
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    "O'Higgins",
    'Maule',
    'Biobío',
    'Araucanía',
    'Los Lagos',
    'Aysén',
    'Magallanes y Antártica',
    'RM',
    'Los Ríos',
    'Arica y Parinacota',
    'Ñuble',
  ];
  const yLabels = jsonTable
    .map((table) => Object.values(table)[0])
    .slice(0, -1);

  const data = jsonTable.map((table) => Object.values(table).slice(1, -1));

  const datasets = yLabels.map((label, i) => ({
    label,
    data: data[i],
    borderWidth: 1,
  }));

  return {
    labels: xLabels,
    datasets,
  };
}

function buildSubAreaContractData(jsonTable) {
  const xLabels = ['Contrato Indefinido', 'NS/NR', 'Plazo Fijo'];
  const yLabels = jsonTable
    .map((table) => Object.values(table)[0])
    .slice(0, -1);

  const data = jsonTable.map((table) => Object.values(table).slice(1, -1));

  const datasets = yLabels.map((label, i) => ({
    label,
    data: data[i],
    borderWidth: 1,
  }));

  return {
    labels: xLabels,
    datasets,
  };
}

export async function getStaticProps(_context) {
  const files = await fs.readdir('public');
  const tableFiles = files.filter((file) => file.includes('.html'));
  const htmlTables = [];

  for (const file of tableFiles) {
    const htmlTable = await fs.readFile(`public/${file}`, 'utf-8');
    htmlTables.push({ filename: file, htmlContent: htmlTable });
  }
  console.log(tableFiles);

  const jsonTable = HtmlTableToJson.parse(htmlTables[2].htmlContent);
  const jsonTableSubAreaContract = HtmlTableToJson.parse(
    htmlTables[3].htmlContent
  );

  const graphData = buildGraphData(jsonTable.results.flat());
  const subAreaContractData = buildSubAreaContractData(
    jsonTableSubAreaContract.results.flat()
  );

  return {
    props: {
      title: 'Análisis Sector Ciencias',
      data: [graphData, subAreaContractData],
    },
  };
}
