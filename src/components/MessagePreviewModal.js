import React from "react";
import { X, Send, Users, MessageSquare, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import "./MessagePreviewModal.css"; // Importing the external stylesheet

export const MessagePreviewModal = ({
  isOpen,
  onClose,
  onConfirmSend,
  recipientCount,
  messageTemplate,
  // New prop object to track stats dynamically
  deliveryStatus = { delivered: 0, pending: 0, isSending: false } 
}) => {
  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Confirm Broadcast</h2>
            <p className="modal-subtitle">Review your message and target status</p>
          </div>
          <button className="ev-icon-btn close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {/* Recipient Counter Card */}
          <div className="recipient-card">
            <div className="recipient-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="recipient-info">
              <span className="card-label">Target Audience</span>
              <div className="counter-flex">
                <span className="counter-number">{recipientCount}</span>
                <span className="counter-text">users selected</span>
              </div>
            </div>
          </div>

          {/* New Status Tracker Row (Delivered vs Pending) */}
          <div className="status-tracker-container">
            <div className="status-box delivered">
              <div className="status-icon-title">
                <CheckCircle2 size={16} className="text-success" />
                <span className="status-label">Delivered</span>
              </div>
              <span className="status-count">{deliveryStatus.delivered}</span>
            </div>

            <div className="status-box pending">
              <div className="status-icon-title">
                <Clock size={16} className="text-pending" />
                <span className="status-label">Pending</span>
              </div>
              <span className="status-count">{deliveryStatus.pending}</span>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="preview-section">
            <label className="card-label preview-label">
              <MessageSquare size={14} /> Message Preview
            </label>
            <div className="preview-textbox">
              {messageTemplate || (
                <span className="preview-placeholder">
                  No message content provided.
                </span>
              )}
            </div>
          </div>

          {/* Context Warning Note */}
          <div className="warning-note">
            <AlertTriangle size={14} />
            <span>
              This action cannot be undone. Messages will be dispatched immediately.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary" disabled={deliveryStatus.isSending}>
            Cancel
          </button>
          <button 
            onClick={onConfirmSend} 
            className="btn-primary" 
            disabled={deliveryStatus.isSending}
          >
            <Send size={16} />
            {deliveryStatus.isSending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
};