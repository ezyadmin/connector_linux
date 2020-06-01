<template lang="pug">
  div
    div(v-if="checkConnectorInstall===null")
      el-alert(title="Loading..." type="warning" :closable="false")
    div(v-else-if="checkConnectorInstall===false")
      el-alert(title="connector Linux not install" type="error" :closable="false")
    div(v-else)
      div(style="margin-bottom:20px;" v-if="_.isEmpty(dataReportBackupConnector) !== true")
        div(style="width:40px; height:35px; text-align:center; float:left; border:1px solid gray; background-color:lightgray")
          div(style="border-bottom:1px solid gray")
            strong Day
          div
            strong Status
        div(v-for="(value, key, index) in dataReportBackupConnector" style="width:24px; height:35px; text-align:center; float:left; border:1px solid gray; background-color:lightgray")
          div {{ key }}
          div
            span(v-if="value.data === false" style="color:red; cursor:pointer;" @click="getReportBackupByDay(key)" :class="{ activeDay: reportBackupDisplayTableClass[key] }") &#10008;
            span(v-else-if="value.data === true" style="color:green") &#10004;
            span(v-else) &#10134;
        div(style="clear:both")

        .brdblock-form(style="margin-top:5px")
          .titletxt-auto-height
            .tabletop.title-col25 Date
            .tabletop.title-col55 Subject
            .tabletopcenter.title-col20 Status
          .clear
          .line-sep
          .cont-bgspace.padform(v-if="reportBackupDataDisplayTable.length > 0" v-for="(value2, key2, index2) in reportBackupDataDisplayTable")
            .txtcont.content-col25 {{ value2.created | displayFormat(settingConfig) }}
            .txtcont.content-col55(style="cursor: pointer;" @click="goToIncidentId(value2._id, value2.subject)") {{ value2.subject }}
            .txtcenter.content-col20 {{ value2.status | displayStatusName }}
            .clear(style='clear:both;')
          .cont-bgspace.padform(v-if="reportBackupDataDisplayTable.length == 0")
            .txtcenter.content-col100 - No data found. -
            .clear(style='clear:both;')
        .clear(style='clear:both;')

</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'backupreportcpanel',
  props: ['server_id', 'select_date'],
  computed: {
    ...mapGetters([])
  },
  components: {},
  data() {
    return {
      connectorModuleName: 'cpanel',
      checkConnectorInstall: null,
      connectorID: '',
      now: new Date(),
      settingConfig: {},
      currentServerID: this.server_id || null,
      currentSelectDate: this.select_date || null,
      dataReportBackupConnector: {},
      reportBackupDataDisplayTable: [],
      reportBackupDisplayTableStack: [],
      reportBackupDisplayTableClass: []
    }
  },
  async created() {
    console.log('----->created:', this.server_id, this.select_date)
    this.getSetting()
    await this.getConnectorByServerID(this.server_id)
    this.getReportBackupConnector()
  },
  watch: {
    async server_id(value) {
      console.log('----->watch:server_id:', value)
      if (value) {
        this.currentServerID = value
        await this.getConnectorByServerID(this.currentServerID)
        this.getReportBackupConnector()
      }
    },
    select_date(value) {
      console.log('----->watch:select_date:', value)
      if (value) {
        this.currentSelectDate = value
        this.getReportBackupConnector()
      }
    }
  },
  methods: {
    getSetting() {
      this.$store.strict.$http
        .get('/settings')
        .then(response => {
          this.settingConfig = response.data
          console.log('----->this.settingConfig', this.settingConfig)
        })
        .catch(e => {
          this.errors.push(e)
        })
    },
    getConnectorByServerID(serverID) {
      let that = this
      return new Promise(function(resolve, reject) {
        // console.log('----->call getConnectorByServerID')
        that.checkConnectorInstall = null
        let uri = '/api/server/' + serverID + '/connectors?emit=true'
        that.$store.strict.$http.get(uri).then(response => {
          let data = response.data || []
          // console.log('----->getConnectorByServerID:data.status:', data.status)
          if (data.status === 1) {
            let result = data.items.find(val => {
              return val.module == that.connectorModuleName
            })
            // console.log('----->getConnectorByServerID:data.items:', data.items, ' -> ', result)
            if (result === undefined) {
              that.checkConnectorInstall = false
            } else {
              that.checkConnectorInstall = true
              that.connectorID = result._id
            }
            console.log(
              '----->getConnectorByServerID:this.checkConnectorInstall:',
              that.checkConnectorInstall,
              that.connectorID
            )
            resolve()
          } else {
            console.log('----->getConnectorByServerID:status error:', data.message)
            resolve()
          }
        })
      })
    },
    getReportBackupConnector() {
      // console.log('----->call getReportBackupConnector')
      if (this.currentServerID !== null) {
        let Y = moment(this.currentSelectDate).format('YYYY')
        let M = moment(this.currentSelectDate).format('M')
        this.$store.strict.$http
          .get(
            '/reports/backup_cpanel?connector=' +
              this.connectorID +
              '&server=' +
              this.currentServerID +
              '&year=' +
              Y +
              '&month=' +
              M
          )
          .then(response => {
            this.dataReportBackupConnector = response.data
            console.log(
              '----->getReportBackupConnector:',
              this.dataReportBackupConnector,
              this.connectorID,
              this.currentServerID
            )

            this.reportBackupDisplayTableStack = [] // reset data with change server
            this.reportBackupDisplayTableClass = [] // reset data with change server
            this.getReportBackupDataDisplayTable()
          })
          .catch(e => {
            console.error(e)
          })
      }
    },
    getReportBackupDataDisplayTable() {
      this.reportBackupDataDisplayTable = []
      if (this.reportBackupDisplayTableStack && this.reportBackupDisplayTableStack.length === 0) {
        // Show all item
        for (const key in this.dataReportBackupConnector) {
          if (this.dataReportBackupConnector.hasOwnProperty(key)) {
            const element = this.dataReportBackupConnector[key]
            for (const key2 in element.result) {
              let obj = this.reportBackupDataDisplayTable.find(o => o._id === element.result[key2]._id)
              if (obj == undefined) {
                this.reportBackupDataDisplayTable.push(element.result[key2])
              }
            }
          }
        }
      } else if (this.reportBackupDisplayTableStack && this.reportBackupDisplayTableStack.length >= 1) {
        for (const key in this.reportBackupDisplayTableStack.sort()) {
          if (this.dataReportBackupConnector.hasOwnProperty(this.reportBackupDisplayTableStack[key])) {
            const element = this.dataReportBackupConnector[this.reportBackupDisplayTableStack[key]]
            for (const key2 in element.result) {
              let obj = this.reportBackupDataDisplayTable.find(o => o._id === element.result[key2]._id)
              if (obj == undefined) {
                this.reportBackupDataDisplayTable.push(element.result[key2])
              }
            }
          }
        }
      }
    },
    getReportBackupByDay(day) {
      if (day && day !== undefined) {
        this.reportBackupDisplayTableClass[day] = !this.reportBackupDisplayTableClass[day]
        let index = this.reportBackupDisplayTableStack.indexOf(day)
        if (index > -1) {
          this.reportBackupDisplayTableStack.splice(index, 1)
        } else {
          this.reportBackupDisplayTableStack.push(day)
        }
        console.log(
          '----->this.reportBackupDisplayTableStack',
          this.reportBackupDisplayTableStack,
          ' ----->class:',
          this.reportBackupDisplayTableClass
        )
        this.getReportBackupDataDisplayTable()
      }
    },
    goToIncidentId(id, subject) {
      this.$router.push({
        name: 'incident_info',
        params: { _id: id, subject: subject }
      })
    }
  },
  filters: {
    displayFormat(datetimeInput, settingConfig) {
      if (!datetimeInput) {
        return
      }
      if (settingConfig && settingConfig.locale && settingConfig.datetime && settingConfig.datetime.shortformat) {
        var code = settingConfig.locale.toLowerCase()
        var localLocale = moment(datetimeInput)
        localLocale.locale(code)
        return localLocale.format(settingConfig.datetime.shortformat + ' HH:mm')
      } else {
        var datetime = moment(datetimeInput)
        return moment(datetime).format('YYYY/MM/DD HH:mm a')
      }
    },
    displayStatusName(status) {
      if (status === undefined || status === null) {
        return '-'
      }
      switch (status) {
        case 'resolve':
        case 'resolved':
          return 'Resolved'
        case 'active':
          return 'Active'
        case 'waiting':
          return 'Waiting for customer response'
        default:
          return status
      }
    }
  }
}
</script>

<style lang="less">
.activeDay {
  position: absolute;
  // color: #ff6600 !important;
  font-size: 20px;
  margin: -5px 0px 0px -8px;
}
</style>