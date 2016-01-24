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
    <asp:Button runat="server" Text="Just a PostBack" />

    <hr />

    <script>

        $('#btn1').click(function () {
            _method('GetDate', { days: 10, text: 'from' }, function (data) {
                alert(data.Dia + ' - ' + data.Valor);
            }, function (err) {
                alert('ERROR: ' + err.Message);
            });
        });

        $('#btn2').click(function () {
            _method('GetDate2', null, null, function (err) {
                alert('ERROR: ' + err.Message);
            });
        });

        $('#btn3').click(function () {
            _method('GetDate2');
        });

        function _method(name, args, onsuccess, onerror) {

            var url = location.href.replace(/\?.*$/, '') + '/' + name;

            return $.ajax({
                type: 'POST',
                url: url,
                data: args == null ? null : JSON.stringify(args),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                cache: false,
                success: function (r) {
                    if (onsuccess) onsuccess(r.d);
                },
                error: function (r) {
                    if (onerror) onerror(JSON.parse(r.responseText));
                }
            });
        }

    
    </script>

</asp:Content>
