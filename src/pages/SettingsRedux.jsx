import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Shield,
  Bell,
  Database,
  Sliders,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchSettings, 
  fetchSettingCategories, 
  updateSetting,
  bulkUpdateSettings,
  exportSettings,
  importSettings,
  resetSettings,
  clearError 
} from "../redux/settingsSlice";

const Settings = () => {
  const dispatch = useDispatch();
  const { 
    settings, 
    categories, 
    loading, 
    updating, 
    bulkUpdating,
    exporting,
    importing,
    resetting,
    error 
  } = useSelector((state) => state.settings);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    value: '',
    displayName: '',
    description: ''
  });
  const [bulkData, setBulkData] = useState({
    settings: [],
    updatedBy: 'admin'
  });
  const [importData, setImportData] = useState({
    settings: {},
    importBy: 'admin',
    overwrite: false
  });
  const [resetData, setResetData] = useState({
    category: '',
    keys: [],
    resetBy: 'admin'
  });

  // Fetch settings and categories on component mount and when filters change
  useEffect(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter
    };
    
    dispatch(fetchSettings(filters));
  }, [dispatch, searchTerm, categoryFilter]);

  useEffect(() => {
    dispatch(fetchSettingCategories());
  }, [dispatch]);

  // Handle setting update
  const handleUpdateSetting = async (category, key, value) => {
    try {
      await dispatch(updateSetting({
        category,
        key,
        settingData: {
          value,
          lastModifiedBy: 'admin'
        }
      })).unwrap();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(bulkUpdateSettings(bulkData)).unwrap();
      setShowBulkModal(false);
      setBulkData({
        settings: [],
        updatedBy: 'admin'
      });
    } catch (error) {
      console.error('Error bulk updating settings:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const result = await dispatch(exportSettings({
        category: categoryFilter,
        includePublic: 'false'
      })).unwrap();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
    }
  };

  // Handle import
  const handleImport = async (e) => {
    e.preventDefault();
    try {
      await dispatch(importSettings(importData)).unwrap();
      setShowImportModal(false);
      setImportData({
        settings: {},
        importBy: 'admin',
        overwrite: false
      });
    } catch (error) {
      console.error('Error importing settings:', error);
    }
  };

  // Handle reset
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await dispatch(resetSettings(resetData)).unwrap();
      setResetData({
        category: '',
        keys: [],
        resetBy: 'admin'
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  // Handle file upload for import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setImportData({
            ...importData,
            settings: json
          });
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Toggle category expansion
  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle setting edit
  const handleEditSetting = (category, key, setting) => {
    setSelectedCategory(category);
    setSelectedKey(key);
    setSelectedSetting(setting);
    setFormData({
      value: setting.value,
      displayName: setting.displayName,
      description: setting.description
    });
    setShowEditModal(true);
  };

  // Handle page refresh
  const handleRefresh = () => {
    const filters = {
      search: searchTerm,
      category: categoryFilter
    };
    
    dispatch(fetchSettings(filters));
    dispatch(fetchSettingCategories());
  };

  // Category icons
  const getCategoryIcon = (category) => {
    const icons = {
      general: <Settings size={20} />,
      security: <Shield size={20} />,
      notifications: <Bell size={20} />,
      integrations: <Globe size={20} />,
      billing: <Database size={20} />,
      system: <Sliders size={20} />,
      ui: <Settings size={20} />
    };
    return icons[category] || <Settings size={20} />;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle size={20} />
              <span>Error loading settings: {error}</span>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {categories.map((category) => (
          <div
            key={category.category}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => toggleCategory(category.category)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-blue-600">
                  {getCategoryIcon(category.category)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {category.category.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.totalSettings} settings
                  </p>
                </div>
              </div>
              <div className="text-gray-400">
                {expandedCategories.has(category.category) ? 
                  <XCircle size={16} /> : 
                  <CheckCircle size={16} />
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search settings..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Settings List */}
      <div className="space-y-4">
        {Object.entries(settings).map(([category, categorySettings]) => {
          if (categoryFilter && category !== categoryFilter) return null;
          
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600">
                      {getCategoryIcon(category)}
                    </div>
                    <h3 className="font-medium text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </h3>
                    <span className="text-sm text-gray-600">
                      ({Object.keys(categorySettings).length} settings)
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4">
                  <div className="space-y-3">
                    {Object.entries(categorySettings).map(([key, setting]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{setting.displayName}</h4>
                            {setting.isPublic && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Public
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Key: {key}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {typeof setting.value === 'boolean' ? 
                                (setting.value ? 'Enabled' : 'Disabled') :
                                setting.value
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {setting.dataType}
                            </div>
                          </div>
                          
                          {setting.isEditable && (
                            <div className="flex gap-2">
                              <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => handleEditSetting(category, key, setting)}
                                title="Edit Setting"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="text-gray-600 hover:text-gray-800"
                                onClick={() => handleUpdateSetting(category, key, setting.value)}
                                title="Save Setting"
                              >
                                <Save size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Setting Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Setting</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Category: <span className="font-medium">{selectedCategory}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Key: <span className="font-medium">{selectedKey}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedSetting?.description}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                {selectedSetting?.dataType === 'boolean' ? (
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value === 'true'})}
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : selectedSetting?.dataType === 'number' ? (
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                  />
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSetting(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  handleUpdateSetting(selectedCategory, selectedKey, formData.value);
                  setShowEditModal(false);
                  setSelectedSetting(null);
                }}
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import Settings</h2>
            <form onSubmit={handleImport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={importData.overwrite}
                    onChange={(e) => setImportData({...importData, overwrite: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700">Overwrite existing settings</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData({
                      settings: {},
                      importBy: 'admin',
                      overwrite: false
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={importing}
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
