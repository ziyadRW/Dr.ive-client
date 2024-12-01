import React, { useState, useEffect } from "react"
import axios from "axios"

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })
  const [activeTab, setActiveTab] = useState("upload")
  const [uniqueIdentifier, setUniqueIdentifier] = useState("")
  const [data, setData] = useState("")
  const [storage, setStorage] = useState("local")
  const [responseMessage, setResponseMessage] = useState("")
  const [retrieveError, setRetrieveError] = useState("")
  const [retrievedData, setRetrievedData] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const apiBaseUrl = "/api/v1/Dr.ive";

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const handleUpload = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("unique_identifier", uniqueIdentifier)
      formData.append("storage", storage)

      if (selectedFile) {
        formData.append("file", selectedFile)
      } else {
        formData.append("data", btoa(data))
      }

      const response = await axios.post(`${apiBaseUrl}/store`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResponseMessage(response.data.message)
      setRetrieveError("")
    } catch (error) {
      setResponseMessage(
        error.response?.data?.error || "An error occurred during upload"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetrieve = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${apiBaseUrl}/show/${uniqueIdentifier}`
      )

      if (response.data.data_type === "text") {
        setRetrievedData({
          type: "text",
          content: response.data.data,
        })
      } else if (response.data.data_type === "file") {
        const fileData = response.data.data
        const filename = response.data.filename

        const blob = new Blob([fileData], { type: response.data.filetype })
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setRetrievedData(null)
      }

      setRetrieveError("")
      setResponseMessage("Data retrieved successfully")
    } catch (error) {
      setRetrieveError(
        error.response?.data?.error || "Data not found"
      )
      setResponseMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Dr.ive API Client</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'upload'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Data
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'retrieve'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('retrieve')}
            >
              Retrieve Data
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="unique-identifier" className="block text-sm font-medium mb-1">
                    Unique Identifier
                  </label>
                  <input
                    id="unique-identifier"
                    type="text"
                    placeholder="Enter a unique identifier"
                    value={uniqueIdentifier}
                    onChange={(e) => setUniqueIdentifier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label htmlFor="data" className="block text-sm font-medium mb-1">
                    Text Data
                  </label>
                  <textarea
                    id="data"
                    placeholder="Enter text data here (leave empty if uploading a file)"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    rows={4}
                  />
                </div>
                <div>
                  <label htmlFor="file" className="block text-sm font-medium mb-1">
                    File Upload
                  </label>
                  <input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label htmlFor="storage" className="block text-sm font-medium mb-1">
                    Storage Type
                  </label>
                  <select
                    id="storage"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="local">Local</option>
                    <option value="s3">S3</option>
                    <option value="database">Database</option>
                  </select>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}

            {activeTab === 'retrieve' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="retrieve-identifier" className="block text-sm font-medium mb-1">
                    Unique Identifier
                  </label>
                  <input
                    id="retrieve-identifier"
                    type="text"
                    placeholder="Enter the unique identifier"
                    value={uniqueIdentifier}
                    onChange={(e) => setUniqueIdentifier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <button
                  onClick={handleRetrieve}
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? "Retrieving..." : "Retrieve"}
                </button>
              </div>
            )}
          </div>
        </div>

        {responseMessage && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md flex items-center">
            <span>✅ {responseMessage}</span>
          </div>
        )}

        {retrieveError && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md flex items-center">
            <span>⚠️ {retrieveError}</span>
          </div>
        )}

        {retrievedData && retrievedData.type === "text" && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Retrieved Text Data</h3>
            </div>
            <div className="p-4">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                {retrievedData.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

