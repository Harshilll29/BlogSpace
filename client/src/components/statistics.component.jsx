import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'; // install @heroicons/react if needed
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BlogPostCard from './blog-post.component';
import Animation from '../common/page-animation';
import Loader from './loader.component';

const TAGS = [
  "informative", "social media", "food", "tech", "finance", "travel",
  "bollywood", "health and fitness", "lifestyle", "fashion and beauty",
  "photography", "music", "sports", "political", "religion"
];

const Statistics = () => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const [stats, setStats] = useState({});
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [loading, setLoading] = useState(true);
  const [yearBlogs, setYearBlogs] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [activeWriters, setActiveWriters] = useState(0);

  useEffect(() => {
    fetchTotalStats();
  }, []);

  useEffect(() => {
    fetchFilteredData();
  }, [selectedYear, selectedTag]);

  const fetchTotalStats = async () => {
    try {
        console.log('Fetching total stats...');
        const response = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/stats/blogs/total-count`);
        console.log('Total stats response:', response.data);
        setTotalBlogs(response.data.totalBlogs);
    } catch (err) {
        console.error('Error fetching total stats:', err.response?.data || err.message);
        setTotalBlogs(0);
    }
};

const fetchFilteredData = async () => {
    setLoading(true);
    try {
        console.log(`Fetching data for year: ${selectedYear}, tag: ${selectedTag}`);
        const [statsRes, blogsRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/stats/stats/${selectedYear}`),
            axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/stats/blogs/filter`, {
                params: {
                    year: selectedYear,
                    tag: selectedTag !== 'all' ? selectedTag : undefined
                }
            })
        ]);

        console.log('Stats response:', statsRes.data);
        console.log('Blogs response:', blogsRes.data);

        setStats(statsRes.data);
        setYearBlogs(blogsRes.data.blogs || []);
        setTagCounts(statsRes.data.tagCounts || {});
    } catch (err) {
        console.error('Error fetching filtered data:', err.response?.data || err.message);
        setStats({});
        setYearBlogs([]);
        setTagCounts({});
    } finally {
        setLoading(false);
    }
};

  if (loading) return <Loader />;

  return (
    <Animation>
      <div className="max-w-[1200px] mx-auto p-4 bg-white dark:bg-black min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Blog Statistics</h1>

          {/* Headless UI Listbox */}
          <Listbox value={selectedYear} onChange={setSelectedYear}>
            <div className="relative w-40">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-black dark:bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 sm:text-sm">
                <span className="block truncate text-white dark:text-black">{selectedYear}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <SelectorIcon className="h-5 w-5 text-gray-300 dark:text-gray-700" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black ring-1 ring-black ring-opacity-5 dark:ring-white focus:outline-none">
  {years.map((year, idx) => (
    <Listbox.Option
      key={idx}
      className={({ active }) =>
        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
          active
            ? 'bg-purple-600 text-white'   // active item colored purple with white text
            : 'text-black dark:text-white' // non-active items black text normally, white text in dark mode
        }`
      }
      value={year}
    >
      {({ selected }) => (
        <>
          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
            {year}
          </span>
          {selected && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600 dark:text-purple-400">
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
        </>
      )}
    </Listbox.Option>
  ))}
</Listbox.Options>

              </Transition>
            </div>
          </Listbox>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:opacity-80 transition"
          >
            Filter by Tags
          </button>
        </div>

        {/* Tag Filters */}
        {showFilters && (
          <div className="mb-8 p-4 rounded-lg shadow bg-black text-white dark:bg-white dark:text-black">
            <h3 className="text-lg font-semibold mb-4">Filter by Tags</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-full font-medium border ${
                  selectedTag === 'all'
                    ? 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
                    : 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white'
                }`}
              >
                All ({Object.values(tagCounts).reduce((sum, count) => sum + count, 0)})
              </button>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full font-medium border ${
                    selectedTag === tag
                      ? 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
                      : 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white'
                  }`}
                >
                  {tag} ({tagCounts[tag] || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-lg shadow p-6 bg-black text-white dark:bg-white dark:text-black">
            <h3 className="text-lg font-semibold mb-2">Total Blogs (All Time)</h3>
            <p className="text-3xl font-bold">{totalBlogs}</p>
          </div>
          <div className="rounded-lg shadow p-6 bg-black text-white dark:bg-white dark:text-black">
            <h3 className="text-lg font-semibold mb-2">
              {selectedYear} Blogs {selectedTag !== 'all' ? `(${selectedTag})` : ''}
            </h3>
            <p className="text-3xl font-bold">{yearBlogs.length}</p>
          </div>
        </div>

        {/* Monthly Chart */}
        {stats.monthlyData && (
          <div className="rounded-lg shadow p-6 bg-black text-white dark:bg-white dark:text-black mb-8">
            <h3 className="text-xl font-semibold mb-4">Monthly Blog Posts</h3>
            <LineChart width={1000} height={400} data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#fff" />
            </LineChart>
          </div>
        )}

        {/* Filtered Blogs */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
            {selectedTag === 'all'
              ? `Blogs from ${selectedYear}`
              : `${selectedTag} blogs from ${selectedYear}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yearBlogs.length > 0 ? (
              yearBlogs.map((blog, i) => (
                <Animation transaction={{ duration: 1, delay: i * 0.1 }} key={blog._id}>
                  <BlogPostCard content={blog} author={blog.author?.personal_info} />
                </Animation>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-black dark:text-white">
                No blogs found for the selected criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </Animation>
  );
};

export default Statistics;
