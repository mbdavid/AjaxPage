<%@ Page Title="" Language="C#" MasterPageFile="~/Content/Page.Master" AutoEventWireup="true" %>
<script runat="server">

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            SetFocus(cmb1);
            ScriptManager.RegisterStartupScript(this, this.GetType(), "ok", "console.log('RegisterStartupScript');", true);
            rpt.DataSource = new string[] { "1", "2", "3" };
            rpt.DataBind();

            TextBox txtRpt = (TextBox)rpt.Items[1].FindControl("txtRpt");

            ltr.Text = "UniqueID: " + txtRpt.UniqueID + " - ClientID: " + txtRpt.ClientID;
        }
    }

    protected void btn1_Click(object sender, EventArgs e)
    {
        txt1.Text = "btn: " + DateTime.Now.ToString();
    }

    protected void lnk1_Click(object sender, EventArgs e)
    {
        txt1.Text = "From LinkButton" + DateTime.Now.Second.ToString();
    }

    protected void cmb1_SelectedIndexChanged(object sender, EventArgs e)
    {
        btn1.Enabled = Convert.ToBoolean(cmb1.SelectedValue);
    }

    protected void txt1_TextChanged(object sender, EventArgs e)
    {
        btn1.Text = DateTime.Now.Second.ToString();
    }

    protected void btnRpt_Command(object sender, CommandEventArgs e)
    {
        var idx = Convert.ToInt32(e.CommandArgument);
        var txt = (TextBox)rpt.Items[idx].FindControl("txtRpt");
        txt.Text = DateTime.Now.ToString();
    }

</script>
<asp:Content ID="ctrContent" ContentPlaceHolderID="content" runat="server">

    <asp:TextBox runat="server" ID="txt1" AutoPostBack="true" OnTextChanged="txt1_TextChanged" /><br />
    <asp:Button runat="server" ID="btn1" Text="Enviar" OnClick="btn1_Click" /><br />
    <asp:LinkButton runat="server" ID="lnk1" Text="Link Button" OnClick="lnk1_Click" /><br />
    <asp:DropDownList runat="server" ID="cmb1" AutoPostBack="true" OnSelectedIndexChanged="cmb1_SelectedIndexChanged">
        <asp:ListItem Value="true" Text="Enable Button" />
        <asp:ListItem Value="false" Text="Disable Button" />
    </asp:DropDownList>
    <hr />
    <asp:Repeater runat="server" ID="rpt">
        <ItemTemplate>
            <asp:TextBox runat="server" ID="txtRpt" />
            <asp:Button runat="server" ID="btnRpt" Text="Enviar" CommandArgument=<%# Container.ItemIndex %> OnCommand="btnRpt_Command" /><br />
        </ItemTemplate>
    </asp:Repeater>
    <br /><asp:Literal runat="server" ID="ltr" />

</asp:Content>
