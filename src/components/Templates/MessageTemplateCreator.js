import React, { useState, useRef } from 'react';
import { Send, Phone, User, Settings, Database, Plus, Trash2, Eye, Edit3 } from 'lucide-react';

const MessageTemplateCreator = () => {
  const [template, setTemplate] = useState({
    subject: 'Account Verification Required',
    message: 'Dear {{name}}, your account requires verification. Please contact us at {{mobile}} or visit our office at {{address}}.',
    sender: 'Business Solutions Inc.',
    variables: [
      { key: 'name', value: 'John Smith' },
      { key: 'mobile', value: '+1 (555) 123-4567' },
      { key: 'email', value: 'john.smith@company.com' },
      { key: 'address', value: '123 Business Ave, Suite 100' }
    ]
  });

  const [previewMode, setPreviewMode] = useState('whatsapp');
  const [draggedVariable, setDraggedVariable] = useState(null);
  const textareaRef = useRef(null);

  // Professional variables for business use
  const predefinedVariables = [
    { key: 'name', label: 'Full Name', icon: 'user', description: 'Customer full name' },
    { key: 'first_name', label: 'First Name', icon: 'user', description: 'Customer first name' },
    { key: 'last_name', label: 'Last Name', icon: 'user', description: 'Customer last name' },
    { key: 'mobile', label: 'Phone Number', icon: 'phone', description: 'Contact phone number' },
    { key: 'email', label: 'Email Address', icon: 'mail', description: 'Email address' },
    { key: 'company', label: 'Company Name', icon: 'building', description: 'Organization name' },
    { key: 'date', label: 'Current Date', icon: 'calendar', description: 'System date' },
    { key: 'time', label: 'Current Time', icon: 'clock', description: 'System time' },
    { key: 'amount', label: 'Amount', icon: 'dollar-sign', description: 'Transaction amount' },
    { key: 'order_id', label: 'Order ID', icon: 'hash', description: 'Order reference number' },
    { key: 'product', label: 'Product Name', icon: 'package', description: 'Product or service' },
    { key: 'address', label: 'Address', icon: 'map-pin', description: 'Physical address' },
    { key: 'invoice_id', label: 'Invoice ID', icon: 'file-text', description: 'Invoice reference' },
    { key: 'due_date', label: 'Due Date', icon: 'calendar', description: 'Payment due date' },
    { key: 'account_id', label: 'Account ID', icon: 'credit-card', description: 'Account identifier' },
    { key: 'support_email', label: 'Support Email', icon: 'help-circle', description: 'Support contact' }
  ];

  const initializeVariable = (key) => {
    const defaultValues = {
      name: 'John Smith',
      first_name: 'John',
      last_name: 'Smith',
      mobile: '+1 (555) 123-4567',
      email: 'john.smith@company.com',
      company: 'Acme Corporation',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      amount: '$1,250.00',
      order_id: 'ORD-2024-001234',
      product: 'Professional Services Package',
      address: '123 Business Avenue, Suite 100, New York, NY 10001',
      invoice_id: 'INV-2024-005678',
      due_date: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-US'),
      account_id: 'ACC-789012',
      support_email: 'support@company.com'
    };
    return defaultValues[key] || 'Sample Value';
  };

  const processTemplate = (text) => {
    let processed = text;
    template.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable.key}}}`, 'g');
      processed = processed.replace(regex, variable.value);
    });
    return processed;
  };

  const handleDragStart = (e, variable) => {
    setDraggedVariable(variable);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedVariable) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBefore = template.message.substring(0, cursorPosition);
    const textAfter = template.message.substring(cursorPosition);
    const variableText = `{{${draggedVariable.key}}}`;
    
    const newMessage = textBefore + variableText + textAfter;
    
    setTemplate(prev => ({ ...prev, message: newMessage }));
    
    const variableExists = template.variables.some(v => v.key === draggedVariable.key);
    if (!variableExists) {
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, { 
          key: draggedVariable.key, 
          value: initializeVariable(draggedVariable.key) 
        }]
      }));
    }
    
    setDraggedVariable(null);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition + variableText.length, cursorPosition + variableText.length);
    }, 0);
  };

  const insertVariable = (variableKey) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBefore = template.message.substring(0, cursorPosition);
    const textAfter = template.message.substring(cursorPosition);
    const variableText = `{{${variableKey}}}`;
    
    const newMessage = textBefore + variableText + textAfter;
    
    setTemplate(prev => ({ ...prev, message: newMessage }));
    
    const variableExists = template.variables.some(v => v.key === variableKey);
    if (!variableExists) {
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, { 
          key: variableKey, 
          value: initializeVariable(variableKey) 
        }]
      }));
    }
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition + variableText.length, cursorPosition + variableText.length);
    }, 0);
  };

  const updateVariable = (index, field, value) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const getIcon = (iconName) => {
    const icons = {
      user: User,
      phone: Phone,
      mail: '📧',
      building: '🏢',
      calendar: '📅',
      clock: '⏰',
      'dollar-sign': '💰',
      hash: '#',
      package: '📦',
      'map-pin': '📍',
      'file-text': '📄',
      'credit-card': '💳',
      'help-circle': '❓'
    };
    
    const IconComponent = icons[iconName];
    if (typeof IconComponent === 'string') {
      return <span className="text-lg">{IconComponent}</span>;
    }
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <span className="text-lg">📝</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Message Template Builder
              </h1>
              <p className="text-gray-600">
                Create professional message templates for WhatsApp Business and Email communications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Variables Panel */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Variables</h2>
              </div>
              <p className="text-sm text-gray-600">
                Drag variables into your message template
              </p>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {predefinedVariables.map((variable) => (
                  <div
                    key={variable.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, variable)}
                    onClick={() => insertVariable(variable.key)}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-150 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100">
                      {getIcon(variable.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{variable.label}</div>
                      <div className="text-xs text-gray-500 truncate">{variable.description}</div>
                    </div>
                    <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                      {`{{${variable.key}}}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-4">
                <Edit3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Template Editor</h2>
              </div>

              {/* Channel Selection */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setPreviewMode('whatsapp')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewMode === 'whatsapp' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm">💬</span>
                  WhatsApp Business
                </button>
                <button
                  onClick={() => setPreviewMode('email')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    previewMode === 'email' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm">📧</span>
                  Email
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Information
                </label>
                <input
                  type="text"
                  value={template.sender}
                  onChange={(e) => setTemplate(prev => ({ ...prev, sender: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter sender name or business name"
                />
              </div>

              {/* Subject Line for Email */}
              {previewMode === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter email subject line"
                  />
                </div>
              )}

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={template.message}
                    onChange={(e) => setTemplate(prev => ({ ...prev, message: e.target.value }))}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                    placeholder="Enter your message template. Use variables like {{name}} or drag them from the left panel."
                  />
                  <div className="absolute top-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    Drop Zone
                  </div>
                </div>
              </div>

              {/* Active Variables */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Variable Preview Values
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.variables.length} active
                  </span>
                </div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {template.variables.map((variable, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Variable</label>
                          <input
                            type="text"
                            value={`{{${variable.key}}}`}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white font-mono"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Preview Value</label>
                          <input
                            type="text"
                            value={variable.value}
                            onChange={(e) => updateVariable(index, 'value', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter preview value"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeVariable(index)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove variable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {template.variables.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No variables added yet</p>
                      <p className="text-xs text-gray-400">Drag variables from the left panel to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phone Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-[600px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-gray-900 h-7 flex items-center justify-between px-6 text-white text-xs">
                    <span className="font-medium">9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  {previewMode === 'whatsapp' ? (
                    // WhatsApp Preview
                    <div className="flex flex-col h-full bg-gray-100">
                      <div className="bg-green-600 text-white p-4 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {(template.sender || 'B')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{template.sender || 'Business'}</div>
                          <div className="text-xs opacity-90">WhatsApp Business</div>
                        </div>
                        <Phone className="w-5 h-5" />
                      </div>

                      <div 
                        className="flex-1 p-4 relative overflow-auto"
                        style={{ backgroundColor: '#e5ddd5' }}
                      >
                        <div className="flex justify-end mb-4">
                          <div className="relative max-w-xs">
                            <div className="bg-green-500 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {processTemplate(template.message) || 'Your message will appear here...'}
                              </div>
                              <div className="flex items-center justify-end gap-1 mt-2">
                                <span className="text-xs opacity-75">
                                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="flex">
                                  <div className="w-3 h-3 opacity-75">
                                    <svg viewBox="0 0 16 15" className="fill-current">
                                      <path d="M15.01 3.316l-.478-.372a.424.424 0 0 0-.654.064L6.397 9.879a.213.213 0 0 1-.301 0L2.803 6.62a.424.424 0 0 0-.654.064l-.478.372a.424.424 0 0 0 .064.654L5.68 11.01a.213.213 0 0 0 .301 0l8.073-6.4a.424.424 0 0 0-.043-.294z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2">
                            <span className="text-gray-400">Type a message</span>
                          </div>
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <Send className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Email Preview
                    <div className="flex flex-col h-full bg-white">
                      <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
                        <span className="text-lg">📧</span>
                        <div className="text-lg font-semibold">Mail</div>
                      </div>

                      <div className="flex-1 p-4 overflow-auto">
                        <div className="space-y-4">
                          <div className="border-b pb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {(template.sender || 'S')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {template.sender || 'Sender'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date().toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {processTemplate(template.subject) || 'Subject line will appear here...'}
                            </h3>
                            <div className="text-gray-700 leading-relaxed text-sm">
                              {processTemplate(template.message) || 'Your email message will appear here...'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Live Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTemplateCreator;