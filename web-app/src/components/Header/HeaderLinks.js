/*eslint-disable*/
import React, {useState, useEffect} from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import { Info, AccountBox, House } from "@material-ui/icons";
import Button from "components/CustomButtons/Button.js";
import styles from "assets/jss/material-kit-react/components/headerLinksStyle.js";
import { useSelector } from "react-redux";
import {language} from "config";
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const classes = useStyles();
  const auth = useSelector(state => state.auth);
  const [loggedIn, setLoggedIn] = useState(false);
  let history = useHistory();

  useEffect(()=>{
    if(auth.info && auth.info.profile){
      setLoggedIn(true);
    }else{
      setLoggedIn(false);
    }
  },[auth.info]);

  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          className={classes.navLink}
          onClick={(e) => { e.preventDefault(); history.push('/') }}
        >
          <House className={classes.icons} />{language.home}
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          className={classes.navLink}
          onClick={(e) => { e.preventDefault(); history.push('/bookings') }}
        >
          {loggedIn?
            <AccountBox className={classes.icons} /> 
            : 
            <AccountBox className={classes.icons} />  
          }         
         
          {loggedIn?
            language.myaccount
            : 
           language.login_signup
          }
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          className={classes.navLink}
          onClick={(e) => { e.preventDefault(); history.push('/about-us') }}
        >
          <Info className={classes.icons} />{language.about_us}
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-twitter"
          title="Follow us on twitter"
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            href="https://twitter.com/exicube"
            target="_blank"
            color="transparent"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-twitter"} />
          </Button>
        </Tooltip>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-facebook"
          title="Follow us on facebook"
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href="https://www.facebook.com/exicube"
            target="_blank"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-facebook"} />
          </Button>
        </Tooltip>
      </ListItem>
    </List>
  );
}
