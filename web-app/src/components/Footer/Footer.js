/*eslint-disable*/
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { List, ListItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-kit-react/components/footerStyle.js";
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(styles);

export default function Footer(props) {
  const classes = useStyles();
  const { whiteFont } = props;
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  const aClasses = classNames({
    [classes.a]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  let history = useHistory();
  return (
    <footer className={footerClasses}>
      <div className={classes.container}>
        <div className={classes.left}>
          <List className={classes.list}>
            <ListItem className={classes.inlineBlock}>
              <a
                style={{cursor:'pointer'}}
                className={classes.block}
                onClick={(e) => { e.preventDefault(); history.push('/') }}
              >
                Home
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a
                className={classes.block}
                style={{cursor:'pointer'}}
                onClick={(e) => { e.preventDefault(); history.push('/bookings') }}
              >
                My Account
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a
                className={classes.block}
                style={{cursor:'pointer'}}
                onClick={(e) => { e.preventDefault(); history.push('/about-us') }}
              >
                About Us
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a
                style={{cursor:'pointer'}}  
                className={classes.block}
                onClick={(e) => { e.preventDefault(); history.push('/privacy-policy') }}
              >
                Privacy Policy
              </a>
            </ListItem>
          </List>
        </div>
        <div className={classes.right}>
          &copy; {1900 + new Date().getYear() + " "} 
          <a
            href="https://exicube.com"
            className={aClasses}
            target="_blank"
          >
            Exicube
          </a>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool
};
