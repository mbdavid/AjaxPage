<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void btn1_Click(object sender, EventArgs e)
    {
        lbl1.Text = (Convert.ToInt32(lbl1.Text) + 1).ToString();
        System.Threading.Thread.Sleep(4000);
    }

    protected void btn2_Click(object sender, EventArgs e)
    {
        throw new Exception("Gerada uma exception");
    }

    protected override void Render(HtmlTextWriter writer)
    {
        base.Render(writer);
    }

</script>
<asp:Content runat="server" ContentPlaceHolderID="head" ID="ctrHead">

    <script>

        $(function () {

            AjaxPage.onstart(function () {
                $('#budybox').show();
            });

            AjaxPage.onend(function () {
                $('#budybox').hide();
            });

            AjaxPage.onreject(function () {
                $('#wait').html('Ainda estou processando...');
            });

            AjaxPage.onerror(function (e) {
                alert(e);
            });

            console.log('somente a primeira vez');

        });
    
    </script>

</asp:Content>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <span id="budybox" style="display: none; background-color: Yellow; position: fixed; top: 0px; left: 0px;"><span id="wait"></span>Aguarde...<a href="javascript:AjaxPage.abort();">cancelar</a></span>

    <h3>No Queue</h3>

    <asp:Label runat="server" ID="lbl1" Text="0" />
    <br />
    <asp:LinkButton runat="server" ID="btn1" Text="Enviar" OnClick="btn1_Click" /><br />
    <asp:LinkButton runat="server" ID="btn2" Text="Error" OnClick="btn2_Click" /><br /> 

</asp:Content>
