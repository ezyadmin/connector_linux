<template lang="pug">
  div(id="patch")
    // pre {{pacthMgr}}
    div(v-if="mainpatch")
      template
        el-alert(v-if="!pacthMgr || isEmptyObject(pacthMgr)", type="warning" show-icon effect="dark" :closable="false" title="Not found data, may be running or not configure agent")
      .line-sep
      .padform
        h3 Patch Manager
      .padform(v-if="pacthMgr && pacthMgr.rpm")
        .txtcont.content-col30
          | Yum Packages Management
        .txtcenter.content-col20
          a(v-if="pacthMgr && pacthMgr.rpm && pacthMgr.rpm.outofdate !== undefined && pacthMgr.rpm.outofdate == false", style="color:green;", @click="showManangeBy('yum')") Latest
          a(v-else-if="pacthMgr && pacthMgr.rpm && pacthMgr.rpm.outofdate !== undefined && pacthMgr.rpm.outofdate == true", style="color:red;", @click="showManangeBy('yum')") Out-of-date
          span(v-else) -
        .clear(style='clear:both;')

      .padform(v-if="pacthMgr && pacthMgr.cpan")
        .txtcont.content-col30 
          | CPAN
        .txtcenter.content-col20
          a(v-if="pacthMgr && pacthMgr.cpan && pacthMgr.cpan.outofdate !== undefined && pacthMgr.cpan.outofdate == false", style="color:green;", @click="showManangeBy('cpan')") Latest
          a(v-else-if="pacthMgr && pacthMgr.cpan && pacthMgr.cpan.outofdate !== undefined && pacthMgr.cpan.outofdate == true", style="color:red;", @click="showManangeBy('cpan')") Out-of-date
          span(v-else) -
        .clear(style='clear:both;',@click="showManangeBy('cpan')")

      .padform(v-if="pacthMgr && pacthMgr.pear")
        .txtcont.content-col30 
          | PEAR
        .txtcenter.content-col20
          a(v-if="pacthMgr && pacthMgr.pear && pacthMgr.pear.outofdate !== undefined && pacthMgr.pear.outofdate == false", style="color:green;", @click="showManangeBy('pear')") Latest
          a(v-else-if="pacthMgr && pacthMgr.pear && pacthMgr.pear.outofdate !== undefined && pacthMgr.pear.outofdate == true", style="color:red;", @click="showManangeBy('pear')") Out-of-date
          span(v-else) -
        .clear(style='clear:both;')
        
      .padform(v-if="pacthMgr && pacthMgr.kernel")
        .txtcont.content-col30 
          | Kernel ที่ไม่ Manage โดย Yum
        .txtcenter.content-col20
          a(v-if="pacthMgr && pacthMgr.kernel && pacthMgr.kernel.outofdate !== undefined && pacthMgr.kernel.outofdate == false", style="color:green;", @click="showManangeBy('kernel')") Latest
          a(v-else-if="pacthMgr && pacthMgr.kernel && pacthMgr.kernel.outofdate !== undefined && pacthMgr.kernel.outofdate == true", @click="showManangeBy('kernel')") Out-of-date
          span(v-else) -
        .clear(style='clear:both;')
    div(v-if="info")
      div(v-if='loading===true')
        | Loading ..
      div(v-if="!loading && filteredItems > 0")
        button.btn.btn-primary(@click="backtoMainPatch()", type='button')
          span.glyphicon.glyphicon-chevron-left
            |   Back
        // div {{ totalItems}} total packages
        .row
            el-col(:span="10")
                | {{ totalItems}} total packages
            //- el-col(:span="10")
            //-     | Vault Password : 
            //-     input(type='password', name="vault", ref='vault', v-model="vault")
            //- el-col(:span="4")
            //-     button(class="btn btn-lg btn-success", style="float: right;" @click="updatePatch(updateBy, null, 'updateAll')")
            //-         span(class="glyphicon glyphicon-globe pull-left")
            //-         | &nbsp Update All
        .brdblock-form
            .titletxt-auto-height
                .tabletop.title-col35 
                     a(@click="sort_by('name');") Item
                .tabletopcenter.title-col20 Current Version
                .tabletopcenter.title-col20 Latest Version
                .tabletopcenter.title-col25
                    a(@click="sort_by('outofdate')") Update now
            .clear
            .line-sep
            .cont-bgspace.padform(v-for="eachSw in orderSwList ")
                .txtcont.content-col40
                    a(@click="showPackageInfo(eachSw._id ,eachSw.name,eachSw.comments)")
                        span(v-if="eachSw.installed!=true", style="color:gray;") {{ eachSw.name }}
                        span(v-if="eachSw.installed==true")
                            span(v-if="eachSw.outofdate!=true") {{ eachSw.name }}
                            span(v-if="eachSw.outofdate==true", style="color:#E6A800;") {{ eachSw.name }}
                
                .txtcenter.content-col20
                    span(v-if="eachSw.installed==true")
                        span(v-if="eachSw.outofdate!=true", style="color:green;") {{ eachSw.version }}
                        span(v-if="eachSw.outofdate==true", style="color:#E6A800;") {{ eachSw.version }}
                .txtcenter.content-col20
                    span(v-if="eachSw.installed==true")
                        span(v-if="eachSw.outofdate!=true", style="color:green;") {{ eachSw.latestversion }}
                        span(v-if="eachSw.outofdate==true", style="color:#E6A800;") {{ eachSw.latestversion }}
                
                .txtcenter.content-col20
                    span(v-if="eachSw.installed==true")
                        div(v-if="eachSw.outofdate!=true") -
                        //div(v-else-if="eachSw.outofdate==true", style="color:red;") {{ eachSw.lastupdate | date }}
                        //    a(@click="showDialogVault(updateCommand, eachSw._id, eachSw.name)")
                        //        div(style="color:red;text-decoration: underline;") Update Now
                        div(v-else-if="eachSw.outofdate==true", style="color:red;")
                            div(v-if="eachSw.history && eachSw.history[0] && eachSw.history[0].hdate") {{ eachSw.history[0].hdate | date }}
                            div(v-else) Out-of-date
                .clear(style='clear:both;')
        br 
        button.btn.btn-primary(@click="backtoMainPatch()", type='button')
          span.glyphicon.glyphicon-chevron-left
            |   Back
      div(v-if='filteredItems == 0 && !loading')
        .col-md-12
          .col-md-12
            | Package name not found.
          br 
          button.btn.btn-primary(@click="backtoMainPatch()", type='button')
            span.glyphicon.glyphicon-chevron-left
              |  Back
      .clear
    // #packageInfo.modal.fade
    modal(name='packageInfo', height="auto", :pivot-y=".5")
      .modal-dialog
        .modal-content
          .modal-header
            button(data-dismiss="modal", @click="closePackageInfo()").close: span &times;
            h4.modal-title Package Infomation : {{ packageInfo.package_name }}
          .modal-body
            form.form-horizontal
              h4 Discription
              | {{ packageInfo.description }}
              br
              h4 History     
              .brdblock-form(v-if="packageInfo.dataSize > 0")
                .titletxt-auto-height
                  .tabletop.title-col40 Update Date/Time
                  .tabletopcenter.title-col30 From Version
                  .tabletopcenter.title-col30 To Version
                .clear
                .line-sep
                .cont-bgspace.padform(v-for="history in packageInfo.data.history")
                  .txtcont.content-col40 {{ history.displayDate }}
                  .txtcenter.content-col30 {{ history.version }}
                    span(v-if="history.version") {{ eachSw.version }}
                    span(v-else="!history.version") -
                  .txtcenter.content-col30 {{ history.updatetoversion }}
                  .clear(style='clear:both;')
                br 
              .col-md-12(v-else='packageInfo.dataSize == 0')
                .col-md-12
                  h3 History not found.
              .clear 
              input.btn-cancel(type='button',value='Close',@click="closePackageInfo()")
</template>

<script>
import PatchDefaultView from '@/app/views/staff/connectors/app/pacthmanager/view_default.vue'
// import patchCpView from '@/app/views/staff/connectors/app/pacth_for_linux/view_package_cp.vue'
export default {
  name: 'StaffApp',
  props: ['prop'],
  components: {
    'patchmanger-detault-view': PatchDefaultView
    // 'patchmanger-cp-view': patchCpView
  },
  computed: {
    orderSwList: function() {
      // return _.orderBy(this.softwaresList, ['name', 'outofdate'], ['asc', 'desc'])
      return _.orderBy(this.softwaresList, ['outofdate', 'name'], ['desc', 'asc'])
    }
  },
  data() {
    return {
      mainpatch: true,
      info: false,

      pacthMgr: {},
      loading: false,
      softwaresList: [],
      currentPage: 1,
      entryLimit: 200,
      filtered: [],
      filteredItems: 0,
      totalItems: 0,
      packageInfo: {},
      vault: null,
      vaultpasswordWarning: null,
      eachSw: {},
      sortBy: 'name',
      moduleName: 'patchmanager',
      deployTask: null,
      updateBy: 'yum',
      server_id: this.prop && this.prop.serverinfo && this.prop.serverinfo._id ? this.prop.serverinfo._id : null
    }
  },
  mounted() {
    this.getSwCountPatchByServer()
    //this.getSwByServer('package', 'rpm')
  },
  methods: {
    getSwCountPatchByServer() {
      this.$store.strict.$http
        .get('/software/summary_patch/5e0307987f0fc331388ff450/' + this.server_id)
        .then(response => {
          this.pacthMgr = response.data
          // resolve(response)
          // this.$store.strict.progress('off')
        })
        .catch(error => {
          reject(error)
        })
    },
    getSwByServer(managedby, from) {
      // if (from) {
      //   this.updateBy = from
      // }
      this.initDataOnLoad()
      console.log(
        'get getSwByServer : ',
        '/software/server/' + this.server_id + '/managedby/' + managedby + '/from/' + from
      )
      this.$store.strict.$http
        .get('/software/server/' + this.server_id + '/managedby/' + managedby + '/from/' + from)
        .then(response => {
          this.softwaresList = response.data
          this.currentPage = 1
          this.entryLimit = 200
          this.filteredItems = this.softwaresList.length
          this.totalItems = this.softwaresList.length
          this.loading = false
          console.log('softwaresList : ', this.softwaresList)
        })
        .catch(error => {
          console.log(error)
        })
    },
    showManangeBy(id) {
      // $('#mainpatch').hide()
      this.mainpatch = false
      console.log('showManangeBy () ==> ', id)
      switch (id) {
        case 'yum':
          this.getSwByServer('package', 'rpm')
          this.updateBy = 'yum'
          // $('#info').show()
          this.info = true
          break
        case 'cpanel':
          this.getSwByServer('cp', 'cpanel')
          this.updateBy = 'cpanel'
          // $('#info').show()
          this.info = true
          break
        case 'da':
          this.getSwByServer('cp', 'da')
          this.updateBy = 'da'
          // $('#info').show()
          this.info = true
          break
        case 'cloudlinux':
          this.getSwByServer('cloudlinux', 'cloudlinux')
          this.updateBy = 'cloudlinux'
          // $('#info').show()
          this.info = true
          break
        case 'cpan':
          this.getSwByServer('thirdparty', 'cpan')
          this.updateBy = 'cpan'
          // $('#info').show()
          this.info = true
          break
        case 'pear':
          this.getSwByServer('thirdparty', 'pear')
          this.updateBy = 'pear'
          // $('#info').show()
          this.info = true
          break
        case 'kernel':
          this.getSwByServer('kernel', 'kernel')
          this.updateBy = 'kernel'
          // $('#info').show()
          this.info = true
          break
        default:
          this.getSwByServer('yum', 'rpm')
          this.updateBy = 'yum'
          // $('#info').show()
          this.info = true
      }
    },
    backtoMainPatch() {
      // $('#info').hide()
      // $('#cpanel').hide()
      // $('#mainpatch').show()
      this.info = false
      this.cpanel = false
      this.mainpatch = true
    },
    showPackageInfo(packageId, packageName, description) {
      // console.log('showPackageInfo() ==> ', packageId, packageName)
      // console.log('#TODO showPackageInfo()')
      //return 1
      this.packageInfo = {
        package_id: packageId,
        package_name: packageName,
        dataSize: 0,
        data: {}
      }
      // console.log('get getPackageInfo : /software/package/' + packageId)
      this.$store.strict.$http
        .get('/software/package/' + packageId)
        .then(response => {
          this.packageInfo.data = response.data
          this.packageInfo.package_id = packageId
          this.packageInfo.package_name = packageName
          this.packageInfo.description = description
          this.packageInfo.dataSize = 0
          if (this.packageInfo.data && this.packageInfo.data.history && this.packageInfo.data.history.length > 0) {
            this.packageInfo.dataSize = this.packageInfo.data.history.length
            for (let i = 0; i < this.packageInfo.data.history.length; i++) {
              if (this.packageInfo.data.history[i].hdate) {
                this.packageInfo.data.history[i].displayDate = moment(this.packageInfo.data.history[i].hdate).format(
                  'YYYY-MM-DD HH:mm:ss'
                )
              } else {
                this.packageInfo.data.history[i].displayDate = '-'
              }
            }
          }
          // $('#packageInfo').modal('show')
          this.$modal.show('packageInfo')
        })
        .catch(error => {
          console.log(error)
        })
    },
    closePackageInfo() {
      this.packageInfo = {}
      // $('#packageInfo').modal('hide')
      this.$modal.hide('packageInfo')
    },
    sort_by(sortKey) {
      this.sortBy = sortKey
    },
    isEmptyObject(someObject) {
      console.log('isEmptyObject ===>', Object.keys(someObject).length)
      if (someObject && Object.keys(someObject) && Object.keys(someObject).length) {
        return false
      } else {
        return true
      }
      // return Object.keys(someObject).length
    },
    initDataOnLoad() {
      this.softwaresList = []
      this.currentPage = 1
      this.entryLimit = 0
      this.filteredItems = 0
      this.totalItems = 0
      this.loading = true
    },
    updatePatch(updateType, swId, swName) {
      console.log('#TODO updatePatch : ', updateType, swId, swName)
      this.getAnsibleServerStatus(updateType, swId, swName)
    },
    getAnsibleServerStatus(updateType, swId, swName) {
      console.log('Call func getAnsibleServerStatus()')
      console.log('===> get url : /ansible/status')
      this.$store.strict.$http
        .get('/ansible/status')
        .then(response => {
          let data = response.data || ''
          if (data.messageStatus === 1) {
            this.$store.strict.$notify.success('Info', 'Check ansible status', 10000)
            this.compileConfig(updateType, swId, swName)
          } else {
            this.$store.strict.$notify.warn('Warning', 'Have problem connection to Ansible Server!!', 20000)
            this.$store.strict.$message.error('Error', data.message, 10000)
          }
        })
        .catch(e => {
          if (e && e.message) {
            this.$store.strict.$message.error('Error', e.message, 10000)
          } else {
            this.$store.strict.$message.error('Error', e, 10000)
          }
        })
    },
    compileConfig(updateType, swId, swName) {
      console.log('Call func compileConfig()')
      this.$store.strict.$http
        .post('/api/connector/' + this.moduleName + '/compileconfig', {})
        .then(response => {
          let data = response.data
          if (data.status === 1) {
            this.$store.strict.$notify.success(
              'Info',
              'Configuration has been successfully to compile. Configuration Reversion:' + data.message.revesion,
              10000
            )
            console.log('createjob(', updateType, swId, swName, ')')
            this.createjob(updateType, swId, swName)
          } else {
            this.$store.strict.$notify.warn('Warning', 'Have problem to compile configuration!!', 20000)
            this.$store.strict.$message.error('Error', data.message, 10000)
          }
        })
        .catch(e => {
          if (e && e.message) {
            this.$store.strict.$message.error('Error', e.message, 10000)
          } else {
            this.$store.strict.$message.error('Error', e, 10000)
          }
        })
    },
    createjob(updateType, swId, swName) {
      console.log('call createjob()')
      let extravars = {
        managed_by: updateType,
        package_id: swId,
        package_name: swName,
        package_version: ''
      }
      let searchtrigger = null
      switch (updateType) {
        case 'yum':
          searchtrigger = 'Yum packages'
          break
        case 'cpanel':
          searchtrigger = 'cPanel packages'
          break
        case 'da':
          searchtrigger = 'DA packages'
          break
        case 'cloudlinux':
          searchtrigger = 'Cloud Linux packages'
          break
        case 'cpan':
          searchtrigger = 'CPAN packages'
          break
        case 'pear':
          searchtrigger = 'PEAR packages'
          break
        case 'kernel':
          searchtrigger = 'Kernel packages'
          break
        default:
          searchtrigger = 'Yum packages'
      }
      this.$store.strict.$http
        .post('/api/connector/' + this.moduleName + '/createjob', {
          sitefile: 'staff-update',
          title: 'Patch Manager : App run update',
          options: {
            servers: [this.server_id],
            extravars: extravars,
            searchtrigger: searchtrigger,
            run_type: 'app'
          }
        })
        .then(response => {
          let data = response.data
          if (data.status === 1) {
            this.$store.strict.$notify.success('Info', 'Job for deploy connector has been created successfully.', 10000)
            console.log('data.message.tasks : ', data.message.tasks)
            console.log('data.message.jobID : ', data.message.jobID)
            this.doDeploy(data.message)
          } else {
            this.$store.strict.$notify.warn('Warning', 'Have problem to create job for deploy!!', 20000)
            this.$store.strict.$message.error('Error', data.message, 10000)
          }
        })
        .catch(e => {
          if (e && e.message) {
            console.log('Error : ', e.message)
            this.$store.strict.$message.error('Error', e.message, 10000)
          } else {
            console.log('Error : ', e)
            this.$store.strict.$message.error('Error', e, 10000)
          }
        })
    },
    async doDeploy(jobInfo) {
      let tasksInfo = jobInfo.tasks || []
      // let hasTaskError = false
      // let runTask = undefined
      this.tasksReadyList = []
      this.tasksErrorList = []
      await Object.keys(tasksInfo).forEach(taskId => {
        if (tasksInfo[taskId].error) {
          this.tasksErrorList.push({
            _id: taskId,
            hostname: tasksInfo[taskId].serverinfo.hostname,
            error: true,
            errorMessage: tasksInfo[taskId].errorMessage
          })
        } else {
          this.tasksReadyList.push({
            _id: taskId,
            hostname: tasksInfo[taskId].serverinfo.hostname
          })
        }
      }, this)
      if (this.tasksErrorList.length > 0 && this.tasksReadyList.length === 0) {
        // this.jobsData[3].status = 'danger'
        // this.jobsData[3].messages = ['<span class="text-danger">Error,Deploy configuration tasks has failed!!</span>']
        this.$store.strict.$message.error('Error', 'Error,Deploy configuration tasks has failed!!', 10000)
      } else if (this.tasksErrorList.length > 0 && this.tasksReadyList.length > 0) {
        // this.jobsData[3].status = 'warning'
        // this.jobsData[3].messages = ['<span class="text-warning">Warning, Deploy configurationsome task(s) has failed!!</span>']
        this.$store.strict.$message.error('Error', 'Deploy configurationsome task(s) has failed!!', 10000)
      } else {
        /**
        this.jobsData[3].status = 'success'
        this.jobsData[2].messages = [
          '<b>Job name:</b> ' + data.message.title,
          '<b>Job ID:</b> ' + data.message.jobID,
        ]
        **/
        this.$store.strict.$notify.success('Info', 'Deploy task has been started.', 10000)
        console.log('this.tasksReadyList : ', this.tasksReadyList)
      }
      if (this.tasksReadyList.length > 0) {
        this.deployTask = this.tasksReadyList[0]._id
        this.doRunDeployTask(jobInfo)
      }
      // this.showReport = true
    },
    async doRunDeployTask(jobInfo) {
      console.log('doRunDeployTask : ', this.deployTask)
      if (this.deployTask !== undefined) {
        this.$store.strict.$http
          .post('/api/connector/' + this.moduleName + '/deploy/task/' + this.deployTask, {
            vault: this.vault
          })
          .then(response => {
            let data = response.data
            if (data.status === 1) {
              /**
            this.$message({
              message: data.items || data.message,
              type: 'success'
            })
            this.taskInQueue = true
            */
              let message = data.items || data.message
              this.$store.strict.$notify.success('Info', message, 10000)
              // this.$router.push('/ticket/job/' + this.deployTask)
            } else {
              // this.$message.error(error.message || error)
              /**
            if (e && e.message) {
              console.log('Error : ', e.message)
              this.$store.strict.$message.error('Error', e.message, 10000)
            } else {
              console.log('Error : ', e)
              this.$store.strict.$message.error('Error', e, 10000)
            }
            **/
              console.log('data : ', data)
              if (data && data.message) {
                this.$store.strict.$message.error('Error', data.message, 10000)
              } else {
                this.$store.strict.$message.error('Error', 'Something error , check log please!!!', 10000)
              }
            }
            if (jobInfo && jobInfo.jobID) {
              this.$router.push('/ticket/job/' + jobInfo.jobID)
            }
          })
          .catch(e => {
            // this.$message.error(error.message || error)
            if (e && e.message) {
              console.log('Error : ', e.message)
              this.$store.strict.$message.error('Error', e.message, 10000)
            } else {
              console.log('Error : ', e)
              this.$store.strict.$message.error('Error', e, 10000)
            }
          })
      }
    }
  }
}
</script>

<style lang="less"></style>
