import Menu from 'ant-design-vue/es/menu'
import Icon from 'ant-design-vue/es/icon'

const { Item, SubMenu } = Menu

export default {
  name: 'SMenu',
  props: {
    menu: {
      type: Array,
      required: true
    },
    theme: {
      type: String,
      required: false,
      default: 'dark'
    },
    mode: {
      type: String,
      required: false,
      default: 'inline'
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      openKeys: [],
      selectedKeys: [],
      cachedOpenKeys: []
    }
  },
  computed: {
    rootSubmenuKeys: vm => {
      const keys = []
      vm.menu.forEach(item => keys.push(item.path))
      return keys
    }
  },
  created () {
    this.updateMenu()
  },
  watch: {
    collapsed (val) {
      if (val) {
        this.cachedOpenKeys = this.openKeys.concat()
        this.openKeys = []
      } else {
        this.openKeys = this.cachedOpenKeys
      }
    },
    $route: function () {
      this.updateMenu()
    }
  },
  methods: {
    renderIcon: function (h, icon) {
      if (icon === 'none' || icon === undefined || icon === '') {
        return null
      }
      const props = {}
      typeof (icon) === 'object' ? props.component = icon : props.type = icon
      return h(Icon, { props: { ...props } })
    },
    renderMenuItem: function (h, menu, pIndex, index) {
      const target = menu.target || null
      return h(Item, { key: menu.url ? menu.url : 'item_' + pIndex + '_' + index }, [
        h('router-link', { attrs: { to: menu.url, target: target } }, [
          this.renderIcon(h, menu.icon),
          h('span', [menu.name])
        ])
      ])
    },
    renderSubMenu: function (h, menu, pIndex, index) {
      const this2_ = this
      const subItem = [h('span', { slot: 'title' }, [this.renderIcon(h, menu.icon), h('span', [menu.name])])]
      const itemArr = []
      const pIndex_ = pIndex + '_' + index
      console.log('menu', menu)
      if (!menu.hideChildrenInMenu) {
        menu.children.forEach(function (item, i) {
          itemArr.push(this2_.renderItem(h, item, pIndex_, i))
        })
      }
      return h(SubMenu, { key: menu.url ? menu.url : 'submenu_' + pIndex + '_' + index }, subItem.concat(itemArr))
    },
    renderItem: function (h, menu, pIndex, index) {
      if (!menu.hidden) {
        return menu.children && !menu.hideChildrenInMenu
          ? this.renderSubMenu(h, menu, pIndex, index)
          : this.renderMenuItem(h, menu, pIndex, index)
      }
    },
    renderMenu: function (h, menuTree) {
      const this2_ = this
      const menuArr = []
      menuTree.forEach(function (menu, i) {
        if (!menu.hidden) {
          menuArr.push(this2_.renderItem(h, menu, '0', i))
        }
      })
      return menuArr
    },
    onOpenChange (openKeys) {
      const latestOpenKey = openKeys.find(key => !this.openKeys.includes(key))
      if (!this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.openKeys = openKeys
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : []
      }
    },
    updateMenu () {
      const path = this.$route.path.replace(/(^[/#]*)|([/#]*$)/, '')
      const paths = path.split('/')
      paths.unshift('')
      this.selectedKeys = [paths.join('/')]
      const openKeys = []
      if (this.mode === 'inline' && paths.length > 1) {
        for (let index = 2; index <= paths.length; index++) {
          openKeys.push(paths.slice(0, index).join('/'))
        }
        const meta = this.$route.meta
        if (meta && meta.parents) {
          openKeys.push(...meta.parents)
        }
      }
      this.collapsed ? (this.cachedOpenKeys = openKeys) : (this.openKeys = openKeys)
    }
  },
  render (h) {
    return h(
      Menu,
      {
        props: {
          theme: this.$props.theme,
          mode: this.$props.mode,
          openKeys: this.openKeys,
          selectedKeys: this.selectedKeys
        },
        on: {
          openChange: this.onOpenChange,
          select: obj => {
            this.selectedKeys = obj.selectedKeys
            this.$emit('select', obj)
          }
        }
      },
      this.renderMenu(h, this.menu)
    )
  }
}
