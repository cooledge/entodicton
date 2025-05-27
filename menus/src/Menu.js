/* eslint no-console:0 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Menu, { SubMenu, Item as MenuItem, Divider } from 'rc-menu';
import 'rc-menu/assets/index.css';
const subMenus = require('./Menu.json')

function handleClick(info) {
  console.log(`clicked ${info.key}`);
  console.log(info);
}

const nestSubMenu = (
  <SubMenu
    title={
      <span className="submenu-title-wrapper">offset sub menu 2</span>
    }
    key="4"
    popupOffset={[10, 15]}
  >
    <MenuItem key="4-1">inner inner</MenuItem>
    <Divider/>
    <SubMenu
      key="4-2"
      title={<span className="submenu-title-wrapper">sub menu 1</span>}
    >
      <SubMenu title={<span className="submenu-title-wrapper">sub 4-2-0</span>} key="4-2-0">
        <MenuItem key="4-2-0-1">inner inner</MenuItem>
        <MenuItem key="4-2-0-2">inner inner2</MenuItem>
      </SubMenu>
      <MenuItem key="4-2-1">inn</MenuItem>
      <SubMenu title={<span className="submenu-title-wrapper">sub menu 4</span>} key="4-2-2">
        <MenuItem key="4-2-2-1">inner inner</MenuItem>
        <MenuItem key="4-2-2-2">inner inner2</MenuItem>
      </SubMenu>
      <SubMenu title={<span className="submenu-title-wrapper">sub menu 3</span>} key="4-2-3">
        <MenuItem key="4-2-3-1">inner inner</MenuItem>
        <MenuItem key="4-2-3-2">inner inner2</MenuItem>
      </SubMenu>
    </SubMenu>
  </SubMenu>
);

function onOpenChange(value) {
  console.log('onOpenChange', value);
}

const getSubMenus = () => {
  const elements = []
  for (const subMenu of subMenus) {
    const { key, ui, children } = subMenu
    elements.push(
      <SubMenu title={<span className="submenu-title-wrapper">{ui}</span>} key={key} id={key}>
        { children.map((child) => <MenuItem key={child.key} id={child.key}>{child.ui}</MenuItem>) }
      </SubMenu>
    )
  }
  return elements
}

const children1 = [
  ...getSubMenus(),
  <SubMenu title={<span className="submenu-title-wrapper">sub menu</span>} key="1">
    <MenuItem key="1-1">0-1</MenuItem>
    <MenuItem key="1-2">0-2</MenuItem>
  </SubMenu>,
  nestSubMenu,
  <MenuItem key="2">1</MenuItem>,
  <MenuItem key="3">outer</MenuItem>,
  <MenuItem key="5" disabled>disabled</MenuItem>,
  <MenuItem key="6">outer3</MenuItem>,
];

const children2 = [
  <SubMenu title={<span className="submenu-title-wrapper">sub menu</span>} key="1">
    <MenuItem key="1-1">0-1</MenuItem>
    <MenuItem key="1-2">0-2</MenuItem>
  </SubMenu>,
  <MenuItem key="2">1</MenuItem>,
  <MenuItem key="3">outer</MenuItem>,
];

const customizeIndicator = <span>Add More Items</span>;

class CommonMenu2 extends React.Component {
  state={
    children: children1,
    overflowedIndicator: undefined,
  }
  toggleChildren = () => {
    this.setState({
      children: this.state.children === children1 ? children2 : children1,
    });
  }
  toggleOverflowedIndicator = () => {
    this.setState({
      overflowedIndicator:
        this.state.overflowedIndicator === undefined ?
          customizeIndicator :
          undefined,
    });
  }
  render() {
    const { triggerSubMenuAction } = this.props;
    const { children, overflowedIndicator } = this.state;
    return (
      <div>
        {this.props.updateChildrenAndOverflowedIndicator && <div>
          <button onClick={this.toggleChildren}>toggle children</button>
          <button onClick={this.toggleOverflowedIndicator}>toggle overflowedIndicator</button>
        </div>}
        <Menu
          onClick={handleClick}
          triggerSubMenuAction={triggerSubMenuAction}
          onOpenChange={onOpenChange}
          selectedKeys={this.props.selectedKeys}
          mode={this.props.mode}
          openAnimation={this.props.openAnimation}
          openKeys={this.props.openKeys}
          defaultOpenKeys={this.props.defaultOpenKeys}
          overflowedIndicator={overflowedIndicator}
        >
          {children}
        </Menu>
      </div>
    );
  }
}

CommonMenu2.propTypes = {
  mode: PropTypes.string,
  openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  triggerSubMenuAction: PropTypes.string,
  defaultOpenKeys: PropTypes.arrayOf(PropTypes.string),
  updateChildrenAndOverflowedIndicator: PropTypes.bool,
};

function CommonMenu({
  triggerSubMenuAction,
  updateChildrenAndOverflowedIndicator,
  selectedKeys,
  mode,
  openAnimation,
  openKeys,
  defaultOpenKeys,
}) {
  const [children, setChildren] = useState(children1); // Initial state: children1
  const [overflowedIndicator, setOverflowedIndicator] = useState(undefined); // Initial state: undefined

  // Toggle children between children1 and children2
  const toggleChildren = () => {
    setChildren(children === children1 ? children2 : children1);
  };

  // Toggle overflowedIndicator between undefined and customizeIndicator
  const toggleOverflowedIndicator = () => {
    setOverflowedIndicator(
      overflowedIndicator === undefined ? customizeIndicator : undefined
    );
  };

  return (
    <div>
      {updateChildrenAndOverflowedIndicator && (
        <div>
          <button onClick={toggleChildren}>toggle children</button>
          <button onClick={toggleOverflowedIndicator}>toggle overflowedIndicator</button>
        </div>
      )}
      <Menu
        onClick={handleClick}
        triggerSubMenuAction={triggerSubMenuAction}
        onOpenChange={onOpenChange}
        selectedKeys={selectedKeys}
        mode={mode}
        openAnimation={openAnimation}
        openKeys={openKeys}
        defaultOpenKeys={defaultOpenKeys}
        overflowedIndicator={overflowedIndicator}
      >
        {children}
      </Menu>
    </div>
  );
}

export default CommonMenu;
