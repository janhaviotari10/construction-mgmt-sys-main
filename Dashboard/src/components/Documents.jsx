import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Documents.css';
import { FaUpload, FaTrash, FaFileAlt, FaHome, FaEye } from 'react-icons/fa'; // Import FaEye for View icon

const Documents = () => {
  const [role, setRole] = useState('Admin');
  const [files, setFiles] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const fetchUploadedDocs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/documents');
      setUploadedDocs(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert(`Failed to fetch documents. Server responded with: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  useEffect(() => {
    fetchUploadedDocs();
  }, []);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleFileChange = (document, e) => {
    const existingDoc = uploadedDocs.find(doc => doc.document_name === document);
    if (existingDoc) {
      alert("Please delete the existing file before uploading a new one.");
      return;
    }
    setFiles({ ...files, [document]: e.target.files[0] });
  };

  const handleUpload = async (document) => {
    const file = files[document];
    if (!file) return alert("Please select a file to upload.");

    const existingDoc = uploadedDocs.find(doc => doc.document_name === document);
    if (existingDoc) {
      return alert("A file already exists for this document. Please delete the existing file first.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    formData.append('document', document);

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(`Uploaded ${document} successfully.`);
      setUploadedDocs([...uploadedDocs, { id: response.data.id, document_name: document, file_path: response.data.file_path }]); // Include file path in uploadedDocs
      setFiles({ ...files, [document]: null });
    } catch (error) {
      console.error("Error uploading file:", error.response);
      alert(`Failed to upload file. Server responded with: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete/${documentId}`);
      alert(`Deleted document successfully.`);
      setUploadedDocs(uploadedDocs.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error("Error deleting file:", error.response);
      alert(`Failed to delete file. Server responded with: ${error.response ? error.response.data.error : error.message}`);
    }
  };

  const documents = {
    Admin: [
      "7/12 | Property Card", "NA Order", "Mojani Nakasha",
      "Final Layout", "Land Resume Paid Receipt", "Aadhar Card",
      "Pan Card", "Cancelled Cheque", "8 A Document", "Other"
    ],
    Architect: [
      "Design Draft", "Final Design", "Sanctional Plan",
      "Sanction Order", "3D Design"
    ],
    Sales: [
      "Search History", "7/12 Property card",
      "Sanction Plan", "KMC Order", "Sale Deed"
    ],
  };

  const currentDocuments = documents[role] || [];

  return (
    <div className="documents-container">
      <div className="documents-header">
        <div className="header-left">
          <Link to="/dashboard" className="dashboard-link-doc">
            <FaHome className="dashboard-icon-doc" />
            Dashboard
          </Link>
          <h1 className="documents-title">Documents Management</h1>
        </div>
        <div className="role-tabs">
          <button
            className={`role-tab ${role === 'Admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('Admin')}
          >
            Owner
          </button>
          <button
            className={`role-tab ${role === 'Architect' ? 'active' : ''}`}
            onClick={() => handleRoleChange('Architect')}
          >
            Architect
          </button>
          <button
            className={`role-tab ${role === 'Sales' ? 'active' : ''}`}
            onClick={() => handleRoleChange('Sales')}
          >
            Sales
          </button>
        </div>
      </div>

      <div className="documents-content">
        <div className="documents-list">
          {currentDocuments.length ? (
            currentDocuments.map((doc, index) => {
              const uploadedDoc = uploadedDocs.find(uploadedDoc => uploadedDoc.document_name === doc);
              const isUploaded = !!uploadedDoc;
              const fileName = files[doc]?.name || '';
              
              return (
                <div className="document-card" key={index}>
                  <div className="document-info">
                    <FaFileAlt className="document-icon" />
                    <div>
                      <h3 className="document-name">{doc}</h3>
                      {isUploaded ? (
                        <span className="document-status uploaded">Uploaded</span>
                      ) : (
                        <span className="document-status missing">Not Uploaded</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="document-actions">
                    <div className="file-input-container">
                      <label className="file-input-label">
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(doc, e)}
                          className="file-input"
                          disabled={isUploaded}
                        />
                        <span className={`file-input-button ${isUploaded ? 'disabled' : ''}`}>
                          {isUploaded ? 'File Uploaded' : 'Choose File'}
                        </span>
                      </label>
                      {fileName && <span className="file-name">{fileName}</span>}
                    </div>
                    
                    <button
                      className={`btn btn-upload ${isUploaded ? 'disabled' : ''}`}
                      onClick={() => {
                        if (isUploaded) {
                          alert("Please delete the existing file before uploading a new one.");
                        } else {
                          handleUpload(doc);
                        }
                      }}
                      disabled={!files[doc] || isUploaded}
                    >
                      <FaUpload /> Upload
                    </button>

                    {isUploaded && (
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(uploadedDoc.id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    )}

                    {isUploaded && (
                      <button
                        className="btn btn-view"
                        onClick={() => window.open(`http://localhost:5000/uploads_new/${uploadedDoc.file_name}`, '_blank')}
                      >
                        <FaEye /> View
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-documents">No documents available for this role.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;