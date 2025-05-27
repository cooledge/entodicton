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

const children1 = getSubMenus()

function CommonMenu({
  triggerSubMenuAction,
  updateChildrenAndOverflowedIndicator,
  selectedKeys,
  mode,
  openAnimation,
  openKeys,
  defaultOpenKeys,
}) {
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
        {children1}
      </Menu>
    </div>
  );
}

export default CommonMenu;
