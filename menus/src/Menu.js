/* eslint no-console:0 */

import React from 'react';
import Menu, { SubMenu, Item as MenuItem } from 'rc-menu';
import 'rc-menu/assets/index.css';
const subMenus = require('./Menu.json')

function handleClick(info) {
  console.log(`clicked ${info.key}`);
  console.log(info);
}

function onOpenChange(value) {
  console.log('onOpenChange', value);
}

const getSubMenus = ({ setOpenKeys, setSelectedKeys }) => {
  const elements = []
  const handleMouseEnterMenu = (key) => () => {
    setOpenKeys([key])
    setSelectedKeys([])
  };
  const handleMouseEnterMenuItem = (key) => () => {
    setSelectedKeys([key])
  };
  for (const subMenu of subMenus) {
    const { key, ui, children } = subMenu
    elements.push(
      <SubMenu onMouseEnter={handleMouseEnterMenu(key)} title={<span className="submenu-title-wrapper">{ui}</span>} key={key} id={key}>
        { children.map((child) => <MenuItem onMouseEnter={handleMouseEnterMenuItem(child.key)} key={child.key} id={child.key}>{child.ui}</MenuItem>) }
      </SubMenu>
    )
  }
  return elements
}

function CommonMenu({
  triggerSubMenuAction,
  updateChildrenAndOverflowedIndicator,
  selectedKeys,
  setSelectedKeys,
  mode,
  openAnimation,
  openKeys,
  setOpenKeys,
  defaultOpenKeys,
}) {
  const children = getSubMenus({ setOpenKeys, setSelectedKeys })
  return (
    <div>
      <Menu
        onClick={handleClick}
        triggerSubMenuAction={triggerSubMenuAction}
        onOpenChange={onOpenChange}
        selectedKeys={selectedKeys}
        mode={mode}
        openAnimation={openAnimation}
        openKeys={openKeys}
        defaultOpenKeys={defaultOpenKeys}
      >
        {children}
      </Menu>
    </div>
  );
}

export default CommonMenu;
