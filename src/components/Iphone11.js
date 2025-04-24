import React from 'react';
import './iPhone11.css';

const WhatsappIPhonePreview = ({ template }) => {
  // Default template if none provided
  const defaultTemplate = {
    header: "Your Header Text",
    body: "This is a sample message body that demonstrates how your template will look in WhatsApp. You can include variables like {{1}}.",
    footer: "Your Footer Text",
    buttons: [
      { type: 'QUICK_REPLY', text: 'Button 1' },
      { type: 'QUICK_REPLY', text: 'Button 2' }
    ]
  };

  const activeTemplate = template || defaultTemplate;

  return (
    <div className="whatsapp-iphone-container">
      <div className="iphone-11">
        <div className="iphone-11-notch"></div>
        <div className="iphone-11-screen">
          <div className="whatsapp-preview">
            {/* WhatsApp header */}
            <div className="whatsapp-header">
              <div className="wa-back-button"></div>
              <div className="wa-contact">
                <div className="wa-contact-avatar"></div>
                <div className="wa-contact-info">
                  <div className="wa-contact-name">Business Name</div>
                  <div className="wa-contact-status">WhatsApp Business</div>
                </div>
              </div>
              <div className="wa-menu-button"></div>
            </div>

            {/* Template content */}
            <div className="whatsapp-content">
              {/* Header content */}
              {activeTemplate.header && (
                <div className="template-header">
                  {activeTemplate.header}
                </div>
              )}

              {/* Message bubble */}
              <div className="whatsapp-message received">
                <div className="message-content">
                  {activeTemplate.body.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                <div className="message-time">10:30 AM</div>
              </div>

              {/* Buttons */}
              {activeTemplate.buttons && activeTemplate.buttons.map((button, index) => (
                <div key={index} className={`whatsapp-button ${button.type.toLowerCase()}`}>
                  {button.text}
                </div>
              ))}

              {/* Footer content */}
              {activeTemplate.footer && (
                <div className="template-footer">
                  {activeTemplate.footer}
                </div>
              )}
            </div>

            {/* WhatsApp input area */}
            <div className="whatsapp-input">
              <div className="wa-input-attachment"></div>
              <div className="wa-input-box">Type a message</div>
              <div className="wa-input-emoji"></div>
              <div className="wa-input-mic"></div>
            </div>
          </div>
        </div>
        <div className="iphone-11-home-indicator"></div>
      </div>
    </div>
  );
};

export default WhatsappIPhonePreview;