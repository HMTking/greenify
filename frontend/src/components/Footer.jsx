// Footer component displaying copyright information and developer details
// Contains social media links and contact information for the developer
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="developer-info">
              <a
                href="mailto:dattpatel2020@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Email"
              >
                <i className="fa-solid fa-envelope"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/datt-patel-a312a5256/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a
                href="https://github.com/HMTking"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
