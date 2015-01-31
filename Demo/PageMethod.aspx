<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
        }
    }


    [System.Web.Services.WebMethod]
    public static object GetDate(int days, string text)
    {
        return new
        {
            Dia = DateTime.Now.AddDays(days).ToString(),
            Valor = DateTime.Now.AddDays(days).Day.ToString() + " - [" + text + "]"
        };
    }

    [System.Web.Services.WebMethod]
    public static void GetDate2()
    {
        throw new Exception("Erro no servico GetDate2");
    }


</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <input type="button" id="btn1" value="AjaxPage.method" />
    <input type="button" id="btn2" value="AjaxPage.method.Error" />
    <input type="button" id="btn3" value="AjaxPage.method.Error.2" />

    <hr />

    <script>

        $(function () {

            $('#btn1').click(function () {

                AjaxPage.method('GetDate', { days: 10, text: 'from' }, function (data) {
                    alert(data.Dia + ' - ' + data.Valor);
                }, function (err) {
                    alert('ERROR: ' + err);
                });

            });

            $('#btn2').click(function () {

                AjaxPage.method('GetDate2', null, null, function (err) {
                    alert('ERROR: ' + err);
                });

            });

            $('#btn3').click(function () {
                AjaxPage.method('GetDate2');
            });


            AjaxPage.onerror = (function (err) { alert('AjaxPage.onerror(' + err + ')'); });

        });

    
    </script>

</asp:Content>
