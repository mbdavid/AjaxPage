<%@ Page Language="C#" MasterPageFile="~/Content/Page.Master" %>
<script runat="server">

    protected void btn1_Click(object sender, EventArgs e)
    {
        lbl1.Text = (Convert.ToInt32(lbl1.Text) + 1).ToString();
        System.Threading.Thread.Sleep(4000);
    }

    protected void btn2_Click(object sender, EventArgs e)
    {
        ClientScript.RegisterClientScriptBlock(this.GetType(), "js", "alert(1);", true);
    }

</script>
<asp:Content ContentPlaceHolderID="head" runat="server">
<script>
    console.log("script na header do abort.aspx");
    $(window).on('request', function (e, xhr) {
        $('#busybox').show();
        //$('#cancel').on('click', function () { xhr.abort(); });
        xhr.always(function () {
            $('#busybox').hide();
        });
    });
</script>
</asp:Content>
<asp:Content ContentPlaceHolderID="content" runat="server">

    <div id="busybox" style="display: none; background-color: Yellow; position: fixed; top: 20px; left: 20px; padding: 20px;">
        Waiting...
        <a id="cancel" href="javascript:;">cancel</a>
    </div>

    Counter = <asp:Label runat="server" ID="lbl1" Text="0" /><br />

    <asp:LinkButton runat="server" Text="Send" OnClick="btn1_Click" />
    <br />
    <asp:LinkButton runat="server" Text="Add Script" OnClick="btn2_Click" />

</asp:Content>
