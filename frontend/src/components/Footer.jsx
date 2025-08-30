// Footer component displaying copyright information and developer details
// Contains social media links and contact information for the developer
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2025 Mini Plant Store. All rights reserved.</p>
            <div className="developer-info">
              <span>
                👨‍💻 <strong>Datt Patel</strong>
              </span>
              <span>🎓 IIIT Surat</span>
              <span>🏆 GATE AIR 387 (CS) | 877 (DS&AI)</span>
              <a
                href="mailto:dattpatel2020@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                📧
              </a>
              <a
                href="https://www.linkedin.com/in/datt-patel-a312a5256/"
                target="_blank"
                rel="noopener noreferrer"
              >
                💼
              </a>
              <a
                href="https://github.com/HMTking"
                target="_blank"
                rel="noopener noreferrer"
              >
                💻
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
