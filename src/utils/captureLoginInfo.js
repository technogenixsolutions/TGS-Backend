import geoip  from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export const captureLoginInfo = (req, res, next) => {
  // Get the user-agent string
  const userAgent = req.headers['user-agent'];
  const parser = new UAParser();
  parser.setUA(userAgent);
  const parsedUA = parser.getResult();

  // Extract device, browser, and OS info
  req.loginInfo = {};
  req.loginInfo.device = (parsedUA.device && parsedUA.device.type) ? parsedUA.device.type : 'unknown';
  req.loginInfo.browser = (parsedUA.browser && parsedUA.browser.name) ? parsedUA.browser.name : 'unknown';
  req.loginInfo.os = (parsedUA.os && parsedUA.os.name) ? parsedUA.os.name : 'unknown';

  // Get the user's IP address
  req.loginInfo.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Get location info from IP (optional - uses geoip-lite or another service)
  const geo = geoip.lookup(req.loginInfo.ip);
  req.loginInfo.location = geo ? `${geo.city}, ${geo.country}` : 'unknown';

  // Get the current login time
  req.loginInfo.loginTime = new Date().toISOString();

  next();
};

