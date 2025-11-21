import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { bookingsAPI, type BookingDocument } from '@/services/api/bookingsAPI';
import { formatDate } from '@/utils/helpers';
import { Icon } from '@/components/common';
import './Statistics.css';

const COLORS = {
  pending: '#ff9500',
  confirmed: '#A8E6CF',
  completed: '#4ECDC4',
  cancelled: '#ff3b30',
  total: '#7FD3B0'
};

export const Statistics: React.FC = memo(() => {
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allBookings = await bookingsAPI.getAllBookings();
        setBookings(allBookings);
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => {
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
      return bookingDate === today;
    });

    const selectedDateBookings = bookings.filter(b => {
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toDate().toISOString().split('T')[0];
      return bookingDate === selectedDate;
    });

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    return {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      today: {
        total: todayBookings.length,
        pending: todayBookings.filter(b => b.status === 'pending').length,
        confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
        completed: todayBookings.filter(b => b.status === 'completed').length,
        cancelled: todayBookings.filter(b => b.status === 'cancelled').length
      },
      selected: {
        total: selectedDateBookings.length,
        pending: selectedDateBookings.filter(b => b.status === 'pending').length,
        confirmed: selectedDateBookings.filter(b => b.status === 'confirmed').length,
        completed: selectedDateBookings.filter(b => b.status === 'completed').length,
        cancelled: selectedDateBookings.filter(b => b.status === 'cancelled').length
      }
    };
  }, [bookings, selectedDate]);

  const barChartData = useMemo(() => {
    return [
      { name: 'Pendientes', value: stats.pending, color: COLORS.pending },
      { name: 'Confirmadas', value: stats.confirmed, color: COLORS.confirmed },
      { name: 'Completadas', value: stats.completed, color: COLORS.completed },
      { name: 'Canceladas', value: stats.cancelled, color: COLORS.cancelled },
    ];
  }, [stats]);

  const pieChartData = useMemo(() => {
    return [
      { name: 'Pendientes', value: stats.pending },
      { name: 'Confirmadas', value: stats.confirmed },
      { name: 'Completadas', value: stats.completed },
      { name: 'Canceladas', value: stats.cancelled },
    ];
  }, [stats]);

  const comparisonData = useMemo(() => {
    return [
      { name: 'Pendientes', Hoy: stats.today.pending, Seleccionada: stats.selected.pending },
      { name: 'Confirmadas', Hoy: stats.today.confirmed, Seleccionada: stats.selected.confirmed },
      { name: 'Completadas', Hoy: stats.today.completed, Seleccionada: stats.selected.completed },
      { name: 'Canceladas', Hoy: stats.today.cancelled, Seleccionada: stats.selected.cancelled },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="statistics-loading">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <div>
          <h2 className="statistics-title">Dashboard</h2>
          <p className="statistics-subtitle">Resumen de reservas y actividad en tiempo real</p>
        </div>
        <div className="statistics-time">
          <span className="time-label">Actualización</span>
          <span className="time-value">{new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="stats-cards-grid">
        <div className="stat-card-modern">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: COLORS.total }}>
              <Icon name="barChart" size={24} color="white" />
            </div>
            <span className="stat-trend">Total</span>
          </div>
          <h3 className="stat-label">Total Reservas</h3>
          <p className="stat-value-modern">{stats.total}</p>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{ width: '100%', background: COLORS.total }}></div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: COLORS.pending }}>
              <Icon name="clock" size={24} color="white" />
            </div>
            <span className="stat-trend pending">Pendiente</span>
          </div>
          <h3 className="stat-label">Pendientes</h3>
          <p className="stat-value-modern">{stats.pending}</p>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`, background: COLORS.pending }}></div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: COLORS.confirmed }}>
              <Icon name="check" size={24} color="white" />
            </div>
            <span className="stat-trend confirmed">Confirmado</span>
          </div>
          <h3 className="stat-label">Confirmadas</h3>
          <p className="stat-value-modern">{stats.confirmed}</p>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{ width: `${stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0}%`, background: COLORS.confirmed }}></div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: COLORS.completed }}>
              <Icon name="checkCircle" size={24} color="white" />
            </div>
            <span className="stat-trend completed">Completado</span>
          </div>
          <h3 className="stat-label">Completadas</h3>
          <p className="stat-value-modern">{stats.completed}</p>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`, background: COLORS.completed }}></div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-header">
            <div className="stat-icon" style={{ background: COLORS.cancelled }}>
              <Icon name="x" size={24} color="white" />
            </div>
            <span className="stat-trend cancelled">Cancelado</span>
          </div>
          <h3 className="stat-label">Canceladas</h3>
          <p className="stat-value-modern">{stats.cancelled}</p>
          <div className="stat-progress">
            <div className="stat-progress-bar" style={{ width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%`, background: COLORS.cancelled }}></div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Distribución de Reservas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Estado de Reservas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="comparison-section">
        <div className="comparison-card">
          <div className="comparison-header">
            <div>
              <h3 className="section-title-modern">Reservas de Hoy</h3>
              <p className="section-date">{formatDate(new Date())}</p>
            </div>
            <div className="total-badge">{stats.today.total} total</div>
          </div>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-item-label">Pendientes</span>
              <span className="stat-item-value" style={{ color: COLORS.pending }}>{stats.today.pending}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Confirmadas</span>
              <span className="stat-item-value" style={{ color: COLORS.confirmed }}>{stats.today.confirmed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Completadas</span>
              <span className="stat-item-value" style={{ color: COLORS.completed }}>{stats.today.completed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Canceladas</span>
              <span className="stat-item-value" style={{ color: COLORS.cancelled }}>{stats.today.cancelled}</span>
            </div>
          </div>
        </div>

        <div className="comparison-card">
          <div className="comparison-header">
            <div>
              <h3 className="section-title-modern">Fecha Seleccionada</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input-modern"
              />
            </div>
            <div className="total-badge">{stats.selected.total} total</div>
          </div>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-item-label">Pendientes</span>
              <span className="stat-item-value" style={{ color: COLORS.pending }}>{stats.selected.pending}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Confirmadas</span>
              <span className="stat-item-value" style={{ color: COLORS.confirmed }}>{stats.selected.confirmed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Completadas</span>
              <span className="stat-item-value" style={{ color: COLORS.completed }}>{stats.selected.completed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Canceladas</span>
              <span className="stat-item-value" style={{ color: COLORS.cancelled }}>{stats.selected.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <h3 className="chart-title">Comparación: Hoy vs Fecha Seleccionada</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip 
              contentStyle={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="Hoy" fill={COLORS.confirmed} radius={[8, 8, 0, 0]} />
            <Bar dataKey="Seleccionada" fill={COLORS.completed} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

Statistics.displayName = 'Statistics';
