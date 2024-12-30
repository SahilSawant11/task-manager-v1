'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Layout from './components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import recharts components directly

const data = [
  { name: 'Pending Issues', value: 30 },
  { name: 'Closed Issues', value: 70 },
];

const COLORS = ['#0088FE', '#00C49F'];

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4">
              {data.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center mr-4">
                  <div
                    className="w-4 h-4 mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span>
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Add more dashboard widgets here */}
      </div>
    </Layout>
  );
}
