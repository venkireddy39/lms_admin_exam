import React from 'react';

const SEOTab = () => {
    return (
        <div className="seo-config">
            <div className="web-header">
                <h2>SEO Settings</h2>
                <p>Optimize your site for search engines.</p>
            </div>

            <div className="st-group">
                <label>Meta Title</label>
                <input type="text" className="st-input" defaultValue="My Online Academy - Learn Code" />
            </div>
            <div className="st-group">
                <label>Meta Description</label>
                <textarea className="st-input" style={{ height: 100, resize: 'none' }} defaultValue="Master web development with our comprehensive courses..." />
            </div>
            <div className="st-group">
                <label>Keywords (comma separated)</label>
                <input type="text" className="st-input" defaultValue="react, javascript, web dev, coding bootcamps" />
            </div>

            <div className="st-group">
                <label>Social Share Image (OG:Image)</label>
                <input type="file" className="form-control" />
            </div>
        </div>
    );
};

export default SEOTab;
