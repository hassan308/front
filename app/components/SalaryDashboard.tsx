import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mockad data baserad på sökordet
const generateMockData = (keyword: string) => {
  // Här skulle vi normalt hämta data från en API baserat på sökordet
  // För nu använder vi hårdkodad data
  return {
    averageSalary: 45000,
    salaryRange: { min: 30000, max: 60000 },
    experienceLevels: [
      { name: 'Junior', value: 35000 },
      { name: 'Medel', value: 45000 },
      { name: 'Senior', value: 55000 },
    ],
  };
};

// Färger anpassade till sidans tema
const colors = ['#6366f1', '#8b5cf6', '#ec4899'];

interface SalaryDashboardProps {
  keyword: string;
}

const SalaryDashboard: React.FC<SalaryDashboardProps> = ({ keyword }) => {
  const data = generateMockData(keyword);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-800">Genomsnittlig lön</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p 
            className="text-4xl font-bold text-indigo-600"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {data.averageSalary} kr/mån
          </motion.p>
          <p className="text-sm text-indigo-500 mt-2">Intervall: {data.salaryRange.min} - {data.salaryRange.max} kr/mån</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-800">Lön per erfarenhetsnivå</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.experienceLevels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a78bfa" />
              <XAxis dataKey="name" stroke="#7c3aed" />
              <YAxis stroke="#7c3aed" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f5f3ff', borderColor: '#8b5cf6' }}
                labelStyle={{ color: '#6d28d9' }}
              />
              <Bar dataKey="value" fill="#8b5cf6">
                {data.experienceLevels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalaryDashboard;