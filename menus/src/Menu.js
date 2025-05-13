/* eslint no-console:0 */

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Menu, { SubMenu, Item as MenuItem, Divider } from 'rc-menu';
import 'rc-menu/assets/index.css';
import animate from 'css-animation';
import { calculateDowns, calculateUps, calculateParents, } from './Helpers';

function handleClick(info) {
  console.log(`clicked ${info.key}`);
  console.log(info);
}

const animation = {
  enter(node, done) {
    let height;
    return animate(node, 'rc-menu-collapse', {
      start() {
        height = node.offsetHeight;
        node.style.height = 0;
      },
      active() {
        node.style.height = `${height}px`;
      },
      end() {
        node.style.height = '';
        done();
      },
    });
  },

  appear() {
    return this.enter.apply(this, arguments);
  },

  leave(node, done) {
    return animate(node, 'rc-menu-collapse', {
      start() {
        node.style.height = `${node.offsetHeight}px`;
      },
      active() {
        node.style.height = 0;
      },
      end() {
        node.style.height = '';
        done();
      },
    });
  },
};

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

const subMenus = [
  {
    key: "File",
    text: "File",
    children: [
      { key: "File-New", text: "New" },
      { key: "File-Open", text: "Open..." },
      { key: "File-OpenRemote", text: "Open Remote..." },
      { key: "File-RecentDocuments", text: "Recent Documents..." },
      { key: "File-Close", text: "Close" },
      { divider: true },
      { key: "File-Wizards", text: "Wizards" },
      { key: "File-Templates", text: "Templates" },
      { divider: true },
      { key: "File-Save", text: "Save" },
      { key: "File-SaveAs", text: "Save As..." },
      { key: "File-SaveRemove", text: "Save Remote..." },
      { key: "File-SaveACopy", text: "Save a Copy..." },
      { key: "File-SaveAll", text: "Save All..." },
      { divider: true },
      { key: "File-Export", text: "Export..." },
      { key: "File-ExportAs", text: "Export As..." },
      { key: "File-Send", text: "Send..." },
      { key: "File-PreviewInWebBrowser", text: "Preview in Web Browser..." },
      { divider: true },
      { key: "File-PrintPreview", text: "Print Preview..." },
      { key: "File-Print", text: "Print..." },
      { key: "File-PrinterSettings", text: "Printer Settings..." },
      { divider: true },
      { key: "File-Properties", text: "Properties..." },
      { key: "File-DigitalSignatures", text: "DigitalSignatures..." },
      { divider: true },
      { key: "File-ExitLibreOffice", text: "Exit LibreOffice..." },
    ]
  }
]

const downs = calculateDowns(subMenus)
const ups = calculateUps(subMenus)
const parents = calculateParents(subMenus)

const move = (direction, units) => {
}

const fileMenu = [
  <SubMenu title={<span className="submenu-title-wrapper">File</span>} key="File">
    <MenuItem key="File-New">New</MenuItem>
    <MenuItem key="File-Open">Open...</MenuItem>
    <MenuItem key="File-OpenRemote">Open Remote...</MenuItem>
    <MenuItem key="File-RecentDocuments">Recent Documents...</MenuItem>
    <MenuItem key="File-Close">Close</MenuItem>
    <Divider/>
    <MenuItem key="File-Wizards">Wizards</MenuItem>
    <MenuItem key="File-Templates">Templates</MenuItem>
    <Divider/>
    <MenuItem key="File-Save">Save</MenuItem>
    <MenuItem key="File-SaveAs">Save As...</MenuItem>
    <MenuItem key="File-SaveRemove">Save Remote...</MenuItem>
    <MenuItem key="File-SaveACopy">Save a Copy...</MenuItem>
    <MenuItem key="File-SaveAll">Save All...</MenuItem>
    <Divider/>
    <MenuItem key="File-Export">Export...</MenuItem>
    <MenuItem key="File-ExportAs">Export As...</MenuItem>
    <MenuItem key="File-Send">Send...</MenuItem>
    <MenuItem key="File-PreviewInWebBrowser">Preview in Web Browser...</MenuItem>
    <Divider/>
    <MenuItem key="File-PrintPreview">Print Preview...</MenuItem>
    <MenuItem key="File-Print">Print...</MenuItem>
    <MenuItem key="File-PrinterSettings">Printer Settings...</MenuItem>
    <Divider/>
    <MenuItem key="File-Properties">Properties...</MenuItem>
    <MenuItem key="File-DigitalSignatures">DigitalSignatures...</MenuItem>
    <Divider/>
    <MenuItem key="File-ExitLibreOffice">Exit LibreOffice...</MenuItem>
  </SubMenu>
]

const getSubMenus = () => {
  const elements = []
  for (const subMenu of subMenus) {
    const { key, text, children } = subMenu
    elements.push(
      <SubMenu title={<span className="submenu-title-wrapper">{text}</span>} key={key}>
        { children.map((child) => <MenuItem key={child.key}>{child.text}</MenuItem>) }
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
