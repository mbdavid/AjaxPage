<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void btn1_Click(object sender, EventArgs e)
    {
        ScriptManager.RegisterClientScriptBlock(this, this.GetType(), "msg", "alert('from server');", true);
    }

    protected void btn2_Click(object sender, ImageClickEventArgs e)
    {
        ScriptManager.RegisterClientScriptBlock(this, this.GetType(), "msg", "alert('from server => x=" + e.X + "');", true);
    }

    protected void btn3_Click(object sender, EventArgs e)
    {
        throw new Exception("Gerada uma exception");
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:LinkButton runat="server" ID="btn1" Text="Tipo LinkButton" OnClick="btn1_Click" /><br />
    <asp:ImageButton runat="server" ID="btn2" Text="Tipo Image" OnClick="btn2_Click" /><br />
    <asp:Button runat="server" ID="btn3" Text="Tipo Input[type=button]" OnClick="btn3_Click" /><br />

</asp:Content>
