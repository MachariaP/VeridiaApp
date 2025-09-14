// Placeholder for creator dashboard page
'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { useBadgesStore } from '../../store/useBadgesStore';
import { useAuth } from '../../context/AuthContext';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { earnBadge } = useBadgesStore();

  const { data: analytics } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: () => api.get(`/analytics/creator/${user?.id}`).then(res => res.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (analytics?.metrics.find(m => m.value > 1000)) {
      earnBadge('top_creator');
    }
  }, [analytics]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold">Creator Dashboard</h1>
      {analytics && (
        <>
          <section className="mt-8">
            <h2 className="text-2xl">Metrics</h2>
            <ul className="space-y-2">
              {analytics.metrics.map(metric => (
                <li key={metric.name}>{metric.name}: {metric.value}</li>
              ))}
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-2xl">Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(analytics.trends).flatMap(([key, values]) => values.map((v, i) => ({ date: i, [key]: v })))}>
                <CartesianGrid />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </section>
          <section className="mt-8">
            <h2>Badges</h2>
            {/* Render badges */}
          </section>
        </>
      )}
    </div>
  );
}